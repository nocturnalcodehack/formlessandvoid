import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Formless and Void - Survey Platform',
  description: 'Interactive survey delivery platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}

