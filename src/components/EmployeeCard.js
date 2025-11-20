import { useState } from "react"

export default function EmployeeCard({ employee = {}, getInitials }) {
  const [expanded, setExpanded] = useState(false)

  const {
    name = "Unknown",
    availability = "Unavailable",
    current_skills,
    interests,
    previous_projects,
    location,
    role,
    email,
    hours_available,
    from_date,
    to_date,
  } = employee || {}

  // robust parsing for SheetDB
  const parseListField = (val) => {
    if (!val && val !== 0) return []
    if (Array.isArray(val)) return val.filter(Boolean)
    if (typeof val === "object" && val !== null) {
      try {
        return Object.values(val).flat().filter(Boolean)
      } catch {
        return []
      }
    }
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch {}
      const sep = val.includes(",") ? "," : val.includes(";") ? ";" : null
      if (sep) return val.split(sep).map((s) => s.trim()).filter(Boolean)
      return val.trim() ? [val.trim()] : []
    }
    return []
  }

  const safeSkills = parseListField(current_skills)
  const safeInterests = parseListField(interests)
  const safePrevious = parseListField(previous_projects)

  const getInitialsColor = (nm) => {
    const colors = ["#0072bc", "#d32f2f", "#2e7d32", "#f57c00", "#7b1fa2"]
    const n = (nm || " ").toString()
    let hash = 0
    for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ""
    try {
      const isoPart = dateStr.split("T")[0].split(" ")[0]
      const parts = isoPart.split("-")
      if (parts.length === 3) {
        const [year, month, day] = parts
        return `${day}-${month}-${year}`
      }
    } catch {}
    return dateStr
  }

  const styles = {
    card: {
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      transition: "all 0.25s ease",
      cursor: "pointer",
      height: expanded ? "auto" : "auto",
    },
    cardHover: {
      transform: "translateY(-6px)",
      boxShadow: "0 10px 24px rgba(0,0,0,0.09)",
    },
    header: {
      padding: "20px",
      background: "#fbfbfd",
      borderBottom: expanded ? "1px solid #f0f0f5" : "none",
    },
    topRow: {
      display: "flex",
      gap: "16px",
      alignItems: "center",
    },
    initialsCircle: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: getInitialsColor(name),
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "24px",
      fontWeight: "700",
      flexShrink: 0,
    },
    nameBlock: {
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
    },
    name: {
      color: "#072a53",
      margin: "0",
      fontSize: "18px",
      fontWeight: 700,
      letterSpacing: "0.2px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    subtitle: {
      margin: "6px 0 0 0",
      color: "#6b7280",
      fontSize: "13px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    infoList: {
      marginTop: "14px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    infoRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13px",
      color: "#374151",
    },
    iconWrap: {
      width: "20px",
      height: "20px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    body: {
      padding: "18px 20px",
      maxHeight: "520px",
      overflowY: "auto",
      background: "#ffffff",
    },
    section: {
      marginBottom: "14px",
    },
    sectionTitle: {
      fontWeight: 700,
      color: "#0b5fa5",
      marginBottom: "8px",
      fontSize: "14px",
    },
    tags: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
    },
    tag: {
      background: "#e8f4ff",
      color: "#0b5fa5",
      padding: "6px 12px",
      borderRadius: "18px",
      fontSize: "12px",
    },
    footerHint: {
      padding: "12px 20px",
      textAlign: "center",
      borderTop: "1px solid #f0f0f5",
      background: "#fbfbfd",
      fontSize: "13px",
      color: "#6b7280",
      display: expanded ? "none" : "block",
    },
    statusDot: {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      display: "inline-block",
      marginRight: "8px",
      flexShrink: 0,
    },
    // styles for small label rows (consistent font)
    detailRowText: {
      fontSize: "13px",
      color: "#374151",
      marginBottom: 6,
    },
    detailLabelStrong: {
      fontWeight: 600,
      marginRight: 8,
    },
  }

  const handleCardClick = (e) => {
    e.stopPropagation()
    setExpanded(!expanded)
  }

  // Inline icons
  const IconBriefcase = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 3h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v3H3V6a1 1 0 0 1 1-1h3V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 11v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const IconPin = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1 1 18 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="currentColor"/>
    </svg>
  )

  const IconMail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 7.5v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7.5l-9 6-9-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const IconClock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 7v6l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  const statusKey = (availability || "").toString().toLowerCase()
  const statusColor = statusKey === "available" ? "#2e7d32" : statusKey === "unavailable" ? "#d32f2f" : "#f57c00"
  const isPartial = statusKey === "partially available"

  return (
    <div
      style={styles.card}
      onClick={handleCardClick}
      onMouseEnter={(e) => !expanded && Object.assign(e.currentTarget.style, styles.cardHover)}
      onMouseLeave={(e) =>
        !expanded &&
        Object.assign(e.currentTarget.style, { transform: "translateY(0)", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" })
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? handleCardClick(e) : null)}
      aria-expanded={expanded}
    >
      {/* header: name, role, availability */}
      <div style={styles.header}>
        <div style={styles.topRow}>
          <div style={styles.initialsCircle} aria-hidden>
            {getInitials ? getInitials(name) : (name || "U").slice(0, 1).toUpperCase()}
          </div>

          <div style={styles.nameBlock}>
            <h3 style={styles.name}>{name}</h3>
            <p style={styles.subtitle}>
              {role ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={styles.iconWrap}>
                    <IconBriefcase />
                  </span>
                  <span>{role}</span>
                </span>
              ) : (
                <span style={{ color: "#9ca3af" }}>No role specified</span>
              )}
            </p>

            {/* availability stays in header (collapsed view shows this) */}
            <div style={{ marginTop: 10 }}>
              <div style={{ ...styles.infoRow, alignItems: "center" }} aria-label={`Status: ${availability}`}>
                <span style={{ ...styles.statusDot, background: statusColor }} />
                <strong style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{availability}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* expanded content */}
      {expanded && (
        <div style={styles.body}>
          {/* If partially available show Hours/From/To right away (top of expanded content) */}
          {isPartial && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={styles.iconWrap}>
                  <IconClock />
                </span>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={styles.detailRowText}>
                    <span style={styles.detailLabelStrong}>Hours:</span>
                    <span>{hours_available ? `${hours_available} hours/day` : "Not specified"}</span>
                  </div>
                  <div style={styles.detailRowText}>
                    <span style={styles.detailLabelStrong}>From:</span>
                    <span>{from_date ? formatDateDisplay(from_date) : "—"}</span>
                  </div>
                  <div style={styles.detailRowText}>
                    <span style={styles.detailLabelStrong}>To:</span>
                    <span>{to_date ? formatDateDisplay(to_date) : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {location && (
            <div style={styles.section}>
              <div style={styles.infoRow}>
                <span style={styles.iconWrap}>
                  <IconPin />
                </span>
                <span style={{ fontSize: "13px", color: "#374151" }}>{location}</span>
              </div>
            </div>
          )}

          {/* Email */}
          {email && (
            <div style={styles.section}>
              <div style={styles.infoRow}>
                <span style={styles.iconWrap}>
                  <IconMail />
                </span>
                <a href={`mailto:${email}`} style={{ color: "#0b5fa5", textDecoration: "none", fontSize: "13px" }}>
                  {email}
                </a>
              </div>
            </div>
          )}

          {/* Skills */}
          {safeSkills && safeSkills.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Skills</div>
              <div style={styles.tags}>
                {safeSkills.map((skill) => (
                  <span key={skill} style={styles.tag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {safeInterests && safeInterests.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Interests</div>
              <div style={styles.tags}>
                {safeInterests.map((interest) => (
                  <span key={interest} style={{ ...styles.tag, background: "#f3e5f5", color: "#7b1fa2" }}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Previous projects */}
          {safePrevious && safePrevious.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Previous projects</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: "13px", color: "#374151" }}>
                {safePrevious.map((proj, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    {proj}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={styles.footerHint}>Click to expand →</div>
    </div>
  )
}
