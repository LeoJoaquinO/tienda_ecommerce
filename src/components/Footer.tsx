export default function Footer() {
  return (
    <footer className="bg-secondary">
      <div className="container py-4 text-center text-sm text-secondary-foreground">
        <p>&copy; {new Date().getFullYear()} Tienda Simple. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
