export default function AdminLoading() {
  return (
    <div className="admin-loading" aria-label="Cargando panel" aria-busy="true">
      <span className="admin-loading__line admin-loading__line--title" />
      <span className="admin-loading__line admin-loading__line--intro" />
      <div className="admin-loading__panel">
        <span className="admin-loading__line" />
        <span className="admin-loading__line" />
        <span className="admin-loading__line" />
      </div>
      <span className="sr-only">Cargando solicitudes…</span>
    </div>
  );
}
