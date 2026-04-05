'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/liga/betplay', label: 'Liga BetPlay' },
  { href: '/liga/premier', label: 'Premier League' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar} id="main-navbar">
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo} id="nav-logo">
          <span className={styles.logoIcon}>⚽</span>
          <span className={styles.logoText}>
            Mi<span className={styles.logoAccent}>Futbolito</span>Fc
          </span>
        </Link>

        <ul className={styles.links}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${
                  pathname === link.href ? styles.active : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
