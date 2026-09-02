#!/usr/bin/env swift

// 用 Vision 的主体抠图（就是相册里「拷贝主体」那个功能）把实拍照里的人抠成透明 PNG。
//
// 为什么不复用 cutout-ip.py：那套是从画布四边往里 flood fill 纯白底，只对生图工具
// 吐出来的白底插画有效。实拍照是餐厅背景，只能上语义分割。
//
// 用法:
//     swift scripts/lift-subject.swift <输入图> <输出PNG>

import AppKit
import CoreImage
import Foundation
import Vision

func fail(_ message: String) -> Never {
    FileHandle.standardError.write(Data("[lift-subject] \(message)\n".utf8))
    exit(1)
}

let args = CommandLine.arguments
guard args.count == 3 else {
    fail("用法: swift scripts/lift-subject.swift <输入图> <输出PNG>")
}

let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard FileManager.default.fileExists(atPath: inputURL.path) else {
    fail("找不到输入图: \(inputURL.path)")
}

let handler = VNImageRequestHandler(url: inputURL, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()

do {
    try handler.perform([request])
} catch {
    fail("Vision 请求失败: \(error.localizedDescription)")
}

guard let observation = request.results?.first else {
    fail("没检测到任何前景主体")
}

let instances = observation.allInstances
guard !instances.isEmpty else {
    fail("allInstances 是空的")
}

/*
 * 关键一步：这张照片右后方餐桌还坐着两个路人，Vision 会把他们识别成独立实例。
 * 直接把 allInstances 全合成会连路人一起抠出来，所以逐个量掩膜面积，取最大的。
 * 主体在画面正中且占比远大于背景路人，按面积挑是稳的。
 */
func maskArea(_ instance: Int) throws -> (area: Int, total: Int) {
    let buffer = try observation.generateScaledMaskForImage(
        forInstances: IndexSet(integer: instance),
        from: handler
    )
    CVPixelBufferLockBaseAddress(buffer, .readOnly)
    defer { CVPixelBufferUnlockBaseAddress(buffer, .readOnly) }

    let width = CVPixelBufferGetWidth(buffer)
    let height = CVPixelBufferGetHeight(buffer)
    let stride = CVPixelBufferGetBytesPerRow(buffer)
    guard let base = CVPixelBufferGetBaseAddress(buffer) else { return (0, width * height) }

    // 掩膜是 32 位浮点单通道，取值 0~1
    var covered = 0
    for y in 0..<height {
        let row = base.advanced(by: y * stride).assumingMemoryBound(to: Float32.self)
        for x in 0..<width where row[x] > 0.5 {
            covered += 1
        }
    }
    return (covered, width * height)
}

var best = -1
var bestArea = 0
print("[lift-subject] 检测到 \(instances.count) 个前景实例:")
for instance in instances {
    let (area, total) = (try? maskArea(instance)) ?? (0, 1)
    let pct = Double(area) / Double(total) * 100
    print(String(format: "   实例 %d  覆盖 %d px  占画面 %.1f%%", instance, area, pct))
    if area > bestArea {
        bestArea = area
        best = instance
    }
}

guard best >= 0 else { fail("所有实例面积都是 0") }
print("[lift-subject] 选中实例 \(best)")

let masked: CVPixelBuffer
do {
    masked = try observation.generateMaskedImage(
        ofInstances: IndexSet(integer: best),
        from: handler,
        croppedToInstancesExtent: true
    )
} catch {
    fail("生成抠图失败: \(error.localizedDescription)")
}

let ciImage = CIImage(cvPixelBuffer: masked)
let context = CIContext()
guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else {
    fail("拿不到 sRGB 色彩空间")
}

do {
    try context.writePNGRepresentation(
        of: ciImage,
        to: outputURL,
        format: .RGBA8,
        colorSpace: colorSpace
    )
} catch {
    fail("写 PNG 失败: \(error.localizedDescription)")
}

let size = ciImage.extent
print("[lift-subject] 已写出 \(outputURL.path)  \(Int(size.width))x\(Int(size.height))")
