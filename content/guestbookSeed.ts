/**
 * Guestbook 在 Redis 里还是空的时候，灌进去的几条复古种子留言。
 * 只在服务端第一次 GET 空列表时写入，之后以真实留言为准。
 */
export type GuestbookEntry = {
  id: string;
  handle: string;
  message: string;
  createdAt: string;
};

export const guestbookSeed: GuestbookEntry[] = [
  {
    id: "seed-1",
    handle: "xX_webmaster_Xx",
    message: "sik site!!! sign my guestbook back 😎",
    createdAt: "1999-08-14T12:00:00.000Z",
  },
  {
    id: "seed-2",
    handle: "Sk8rBoi2001",
    message: "this rules. added to my Favorites!",
    createdAt: "2001-03-02T12:00:00.000Z",
  },
  {
    id: "seed-3",
    handle: "auntie_carol",
    message: "this looks very professional dear ❤️",
    createdAt: "2002-11-22T12:00:00.000Z",
  },
  {
    id: "seed-4",
    handle: "NetscapeNavigator",
    message: "best viewed in 800x600. two thumbs up.",
    createdAt: "1998-06-09T12:00:00.000Z",
  },
];
