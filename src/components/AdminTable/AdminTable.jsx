import './AdminTable.css'

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}h ${m % 60}m ago`
  return `${m}m ago`
}

export default function AdminTable({ containers, onTerminate, terminatingId }) {
  if (!containers || containers.length === 0) {
    return (
      <div className="admin-table-empty">
        <span className="text-muted">No running containers.</span>
      </div>
    )
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Container ID</th>
            <th>Lab</th>
            <th>Port</th>
            <th>Started</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {containers.map(c => (
            <tr key={c.id}>
              <td>
                <span className="user-cell">
                  {c.username.startsWith('anon_')
                    ? <><span className="badge badge-blue">anon</span> {c.username}</>
                    : <><span className="status-dot running"></span> {c.username}</>
                  }
                </span>
              </td>
              <td><span className="container-id">{c.id}</span></td>
              <td>{c.labTitle}</td>
              <td><span className="port-num">{c.port}</span></td>
              <td><span className="time-ago">{timeAgo(c.startedAt)}</span></td>
              <td>
                <span className={`status-badge status-${c.status}`}>
                  {c.status}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onTerminate(c.id)}
                  disabled={terminatingId === c.id}
                >
                  {terminatingId === c.id ? <span className="spinner" style={{ width: 12, height: 12 }}></span> : 'Terminate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
