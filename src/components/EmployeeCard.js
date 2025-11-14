import { useState } from "react"

export default function EmployeeCard({ employee, getInitials }) {
  const [expanded, setExpanded] = useState(false)
  const {
    empid,
    name,
    availability,
    current_skills,
    interests,
    previous_projects,
    location,
    role,
    email,
    hours_available,
    from_date,
    to_date,
  } = employee

  const getInitialsColor = (name) => {
    const colors = ["#0072bc", "#d32f2f", "#2e7d32", "#f57c00", "#7b1fa2"]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${day}-${month}-${year}`;
  };


  const styles = {
    card: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      height: expanded ? "auto" : "auto",
    },
    cardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
    },
    header: {
      padding: "20px",
      background: "#f9f9f9",
      borderBottom: expanded ? "1px solid #eee" : "none",
    },
    initialsCircle: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: getInitialsColor(name),
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "15px",
    },
    name: {
      color: "#0072bc",
      margin: "10px 0",
      fontSize: "18px",
      fontWeight: "600",
    },
    info: {
      margin: "8px 0",
      fontSize: "13px",
      color: "#666",
    },
    infoLabel: {
      fontWeight: "600",
      color: "#333",
    },
    body: {
      padding: "20px",
      maxHeight: "500px",
      overflowY: "auto",
    },
    section: {
      marginBottom: "15px",
    },
    sectionTitle: {
      fontWeight: "600",
      color: "#0072bc",
      marginBottom: "8px",
      fontSize: "14px",
    },
    tags: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },
    tag: {
      background: "#e3f2fd",
      color: "#0072bc",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
    },
  }

  const handleCardClick = (e) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <div
      style={styles.card}
      onClick={handleCardClick}
      onMouseEnter={(e) => !expanded && Object.assign(e.currentTarget.style, styles.cardHover)}
      onMouseLeave={(e) =>
        !expanded &&
        Object.assign(e.currentTarget.style, { transform: "translateY(0)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" })
      }
    >
      <div style={styles.header}>
        <div style={styles.initialsCircle}>{getInitials(name)}</div>
        <h3 style={styles.name}>{name}</h3>
        <p style={styles.info}>
          <span style={styles.infoLabel}>ID:</span> {empid}
        </p>
        {role && (
          <p style={styles.info}>
            <span style={styles.infoLabel}>Role:</span> {role}
          </p>
        )}
        {location && (
          <p style={styles.info}>
            <span style={styles.infoLabel}>Location:</span> {location}
          </p>
        )}
        {email && (
          <p style={styles.info}>
            <span style={styles.infoLabel}>Email:</span> {email}
          </p>
        )}
        <p style={styles.info}>
          <span style={styles.infoLabel}>Status:</span>
          <span
            style={{
              marginLeft: "8px",
              color:
                availability === "Available"
                  ? "#2e7d32"
                  : availability === "Unavailable"
                  ? "#d32f2f"
                  : "#f57c00",
            }}
          >
            {availability}
          </span>
        </p>

        {availability === "Partially Available" && expanded && (
          <div style={{ marginTop: "8px", paddingLeft: "10px" }}>
            <p style={styles.info}>
              <span style={styles.infoLabel}>Hours Available:</span> {hours_available}
            </p>
            <p style={styles.info}>
              <span style={styles.infoLabel}>From Date:</span> {formatDateDisplay(from_date ? from_date.split("T")[0] : "")}
            </p>
            <p style={styles.info}>
              <span style={styles.infoLabel}>To Date:</span> {formatDateDisplay(to_date ? to_date.split("T")[0] : "")}
            </p>
          </div>
        )}

        {current_skills && current_skills.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Skills</div>
            <div style={styles.tags}>
              {current_skills.slice(0, 3).map((skill) => (
                <span key={skill} style={styles.tag}>
                  {skill}
                </span>
              ))}
              {current_skills.length > 3 && <span style={styles.tag}>+{current_skills.length - 3} more</span>}
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div style={styles.body}>
          {current_skills && current_skills.length > 3 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>All Skills</div>
              <div style={styles.tags}>
                {current_skills.map((skill) => (
                  <span key={skill} style={styles.tag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interests && interests.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Interests</div>
              <div style={styles.tags}>
                {interests.map((interest) => (
                  <span key={interest} style={{ ...styles.tag, background: "#f3e5f5", color: "#7b1fa2" }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {previous_projects && previous_projects.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Previous Projects</div>
              <ul style={{ margin: "0", paddingLeft: "20px", fontSize: "13px" }}>
                {previous_projects.map((proj, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    {proj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          padding: "12px 20px",
          textAlign: "center",
          borderTop: "1px solid #eee",
          background: "#f9f9f9",
          fontSize: "13px",
          color: "#666",
          display: expanded ? "none" : "block",
        }}
      >
        Click to expand →
      </div>
    </div>
  )
}