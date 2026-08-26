"use client";

import { contacts } from "@content/site";

import styles from "./apps.module.css";

export default function Contact() {
  return (
    <div className={styles.page}>
      <p className={styles.headline}>给我发消息</p>
      <p className={styles.muted}>随便哪个渠道都行，我都看。</p>

      <fieldset>
        <legend>联系方式</legend>
        <table className={styles.specTable}>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.label}>
                <th scope="row">{contact.label}:</th>
                <td>
                  {contact.href ? (
                    <a href={contact.href} target="_blank" rel="noreferrer">
                      {contact.value}
                    </a>
                  ) : (
                    contact.value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>
    </div>
  );
}
