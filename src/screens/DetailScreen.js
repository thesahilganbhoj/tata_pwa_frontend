// DetailScreen.js
import React, { useEffect, useState } from "react"
import { API_URL } from "../config"


export default function DetailScreen({ employee = null, onBack, onSaveDetails }) {
  // detail fields
  const [currentProject, setCurrentProject] = useState("")
  const [noCurrentProject, setNoCurrentProject] = useState(false)
  const [availability, setAvailability] = useState("Unavailable")
  const [hoursAvailable, setHoursAvailable] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [skills, setSkills] = useState([]) // array
  const [interests, setInterests] = useState("") // comma-separated string in UI
  const [previousProjects, setPreviousProjects] = useState("") // newline separated in UI

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // responsive
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 900 : false)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // helper to parse list-like values (SheetDB often returns strings, arrays, or keyed objects)
  const parseListField = (val) => {
    if (!val && val !== 0) return []
    if (Array.isArray(val)) return val.filter(Boolean)
    if (typeof val === "object" && val !== null) {
      try {
        // object may be like { "0": "a", "1": "b" } from some backends
        return Object.values(val).flat().filter(Boolean)
      } catch {
        return []
      }
    }
    if (typeof val === "string") {
      // try JSON
      try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) return parsed.filter(Boolean)
      } catch {}
      const sep = val.includes(",") ? "," : val.includes(";") ? ";" : null
      if (sep) return val.split(sep).map((s) => s.trim()).filter(Boolean)
      // possibly newline separated
      if (val.includes("\n")) return val.split("\n").map((s) => s.trim()).filter(Boolean)
      return val.trim() ? [val.trim()] : []
    }
    return []
  }

  // populate detail fields from employee prop
  useEffect(() => {
    if (!employee) return
    const cp = employee.current_project || employee.currentProject || ""
    setCurrentProject(cp)
    setNoCurrentProject(!cp)
    const av = employee.availability || "Unavailable"
    setAvailability(av)
    setHoursAvailable(employee.hours_available || employee.hoursAvailable || "")
    setFromDate(employee.from_date ? employee.from_date.split("T")[0] : (employee.fromDate || ""))
    setToDate(employee.to_date ? employee.to_date.split("T")[0] : (employee.toDate || ""))
    setSkills(parseListField(employee.current_skills))
    setInterests(Array.isArray(employee.interests) ? employee.interests.join(", ") : (employee.interests || ""))
    setPreviousProjects(Array.isArray(employee.previous_projects) ? employee.previous_projects.join("\n") : (employee.previous_projects || ""))
  }, [employee])

  // background refresh from API if empid present
  useEffect(() => {
    if (!employee || !employee.empid) return
    const id = employee.empid
    const url = `${API_URL.replace(/\/$/, "")}/api/employees/${encodeURIComponent(id)}`
    ;(async () => {
      try {
        const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
        if (!res.ok) return
        const data = await res.json()
        const obj = Array.isArray(data) ? data[0] || data : data
        if (!obj) return
        // update only detail fields if local ones are empty to avoid clobbering edits
        setCurrentProject((cur) => (cur ? cur : obj.current_project || obj.currentProject || ""))
        setNoCurrentProject((cur) => (cur ? cur : !(obj.current_project || obj.currentProject || "")))
        setAvailability((cur) => (cur ? cur : obj.availability || "Unavailable"))
        setHoursAvailable((cur) => (cur ? cur : (obj.hours_available || obj.hoursAvailable || "")))
        setFromDate((cur) => (cur ? cur : (obj.from_date ? obj.from_date.split("T")[0] : (obj.fromDate || ""))))
        setToDate((cur) => (cur ? cur : (obj.to_date ? obj.to_date.split("T")[0] : (obj.toDate || ""))))
        setSkills((cur) => (cur && cur.length ? cur : parseListField(obj.current_skills)))
        setInterests((cur) => (cur ? cur : (Array.isArray(obj.interests) ? obj.interests.join(", ") : obj.interests || "")))
        setPreviousProjects((cur) => (cur ? cur : (Array.isArray(obj.previous_projects) ? obj.previous_projects.join("\n") : obj.previous_projects || "")))
      } catch (e) {
        // silent
        console.warn("DetailScreen background refresh failed:", e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee && employee.empid])

  // validation
  const errors = {
    // hours required only if partially available
    hours: availability === "Partially Available" && (!hoursAvailable || isNaN(Number(hoursAvailable))) ? "Specify hours" : "",
    fromDate: availability === "Partially Available" && !fromDate ? "From date required" : "",
    toDate: availability === "Partially Available" && !toDate ? "To date required" : "",
  }
  const isValid = () => !Object.values(errors).some(Boolean)

  // response reader
  const readResponse = async (res) => {
    const ct = res.headers.get("content-type") || ""
    try {
      if (ct.includes("application/json")) return await res.json()
      return await res.text()
    } catch {
      return "<unreadable response>"
    }
  }

  // fetch server record by empid (confirm)
  const fetchServerRecord = async (id) => {
    const url = `${API_URL.replace(/\/$/, "")}/api/employees/${encodeURIComponent(id)}`
    const r = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } })
    if (!r.ok) {
      // fallback to fetch all and find
      const listUrl = `${API_URL.replace(/\/$/, "")}/api/employees`
      const lr = await fetch(listUrl, { method: "GET", headers: { "Content-Type": "application/json" } })
      if (!lr.ok) throw new Error(`Failed to fetch record for confirmation (list fetch status ${lr.status})`)
      const arr = await lr.json()
      if (!Array.isArray(arr)) throw new Error("Unexpected list format when confirming save")
      return arr.find((x) => ((x.empid || x.id) + "").toString() === (id + "").toString()) || null
    }
    const data = await r.json()
    return Array.isArray(data) ? data[0] || data : data
  }

  // Save details: write only detail fields, confirm by GET
  const handleSave = async () => {
    setError("")
    if (!employee || !employee.empid) {
      setError("Missing empid — cannot save to server.")
      return
    }

    // If noCurrentProject true -> availability forced to "Available"
    const effectiveAvailability = noCurrentProject ? "Available" : availability

    // simple validation
    if (effectiveAvailability === "Partially Available") {
      if (!isValid()) {
        setError("Please fix validation errors before saving.")
        return
      }
    }

    setSaving(true)
    try {
      // prepare payload: only detail fields
      const payload = {
        current_project: noCurrentProject ? "" : currentProject || "",
        availability: effectiveAvailability,
        hours_available: effectiveAvailability === "Partially Available" ? Number(hoursAvailable) : null,
        from_date: effectiveAvailability === "Partially Available" ? (fromDate || null) : null,
        to_date: effectiveAvailability === "Partially Available" ? (toDate || null) : null,
        current_skills: skills && skills.length ? skills : [],
        interests: (interests || "")
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        previous_projects: (previousProjects || "")
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
      }

      const base = API_URL.replace(/\/$/, "")
      const id = employee.empid
      const target = `${base}/api/employees/${encodeURIComponent(id)}`
      console.log("[DetailScreen] Save payload:", payload, "target:", target)

      // Try PUT
      let res = await fetch(target, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      let body = await readResponse(res)
      console.log("[DetailScreen] PUT", res.status, body)

      // PATCH fallback
      if (!res.ok) {
        console.warn("[DetailScreen] PUT failed; trying PATCH")
        res = await fetch(target, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        body = await readResponse(res)
        console.log("[DetailScreen] PATCH", res.status, body)
      }

      // POST fallback
      if (!res.ok) {
        console.warn("[DetailScreen] PATCH failed; trying POST to collection endpoint")
        const postRes = await fetch(`${base}/api/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empid: id, ...payload }),
        })
        const postBody = await readResponse(postRes)
        console.log("[DetailScreen] POST", postRes.status, postBody)
        if (!postRes.ok) {
          throw new Error(`All update attempts failed. Last status: ${postRes.status}. Body: ${JSON.stringify(postBody)}`)
        }
      }

      // Confirm by fetching record
      const serverRecord = await fetchServerRecord(id)
      if (!serverRecord) throw new Error("Could not fetch record after save — check backend.")

      // Optionally, check that serverRecord availability/current_project match payload
      // but accept server record as source-of-truth
      // Update sessionStorage (merge details only)
      try {
        const existing = JSON.parse(sessionStorage.getItem("user") || "{}")
        // Merge only detail keys into cached user
        const merged = {
          ...existing,
          current_project: serverRecord.current_project ?? serverRecord.currentProject ?? "",
          availability: serverRecord.availability ?? "",
          hours_available: serverRecord.hours_available ?? serverRecord.hoursAvailable ?? null,
          from_date: serverRecord.from_date ?? serverRecord.fromDate ?? null,
          to_date: serverRecord.to_date ?? serverRecord.toDate ?? null,
          current_skills: serverRecord.current_skills ?? serverRecord.currentSkills ?? [],
          interests: serverRecord.interests ?? [],
          previous_projects: serverRecord.previous_projects ?? serverRecord.previousProjects ?? [],
        }
        sessionStorage.setItem("user", JSON.stringify(merged))
      } catch (e) {
        console.warn("sessionStorage merge failed:", e)
      }

      onSaveDetails && onSaveDetails(serverRecord)
      alert("Details saved and confirmed on server.")
    } catch (err) {
      console.error("[DetailScreen] Save error:", err)
      setError(err.message || "Save failed — check console/network")
      alert(`Save failed: ${err.message}. See console/network tab.`)
    } finally {
      setSaving(false)
    }
  }

  // simple helpers for skills tags UI
  const addSkill = (s) => {
    if (!s) return
    if (!skills.includes(s)) setSkills((prev) => [...prev, s])
  }
  const removeSkill = (s) => setSkills((prev) => prev.filter((x) => x !== s))

  // styles (inline)
  const styles = {
    container: {
      maxWidth: 920,
      margin: "18px auto",
      padding: isMobile ? 14 : 20,
      fontFamily: "Segoe UI, Tahoma, sans-serif",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 8px 30px rgba(10,30,60,0.06)",
      color: "#072a53",
    },
    headerRow: { display: "flex", gap: 16, alignItems: "center", marginBottom: 14, flexWrap: "wrap" },
    backBtn: {
      padding: "8px 12px",
      borderRadius: 8,
      background: "transparent",
      border: "1px solid rgba(7,114,188,0.12)",
      cursor: "pointer",
      color: "#072a53",
      fontWeight: 700,
    },
    titleBlock: { display: "flex", flexDirection: "column" },
    title: { margin: 0, fontSize: 20, fontWeight: 800, color: "#072a53" },
    subtitle: { margin: 0, fontSize: 13, color: "#6b7280" },

    formRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 12 },
    field: { display: "flex", flexDirection: "column" },
    label: { fontSize: 13, marginBottom: 6, color: "#374151", fontWeight: 700 },
    input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e6eef8", fontSize: 14, outline: "none", boxSizing: "border-box" },
    textarea: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e6eef8", fontSize: 14, minHeight: 100, boxSizing: "border-box" },
    select: { padding: "10px 12px", borderRadius: 8, border: "1px solid #e6eef8", fontSize: 14, background: "#fff" },

    smallNote: { fontSize: 12, color: "#6b7280", marginTop: 6 },
    tagRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
    tag: { background: "#e8f4ff", color: "#0b5fa5", padding: "6px 10px", borderRadius: 18, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 8 },

    errorBox: { background: "#fff1f1", color: "#b91c1c", padding: 10, borderRadius: 8, marginTop: 8 },
    actions: { display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 18 },
    saveBtn: { padding: "10px 16px", borderRadius: 10, background: "#0072bc", color: "#fff", border: "none", cursor: "pointer", fontWeight: 800, minWidth: 140, opacity: saving ? 0.75 : 1 },
  }

  return (
    <div style={styles.container} role="region" aria-label="Details screen">
      <div style={styles.headerRow}>
        <button type="button" onClick={() => onBack && onBack()} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.titleBlock}>
          <h2 style={styles.title}>Details</h2>
          <div style={styles.subtitle}>Current project, availability, skills & more</div>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.formRow}>
        <div style={styles.field}>
          <label style={styles.label}>Current Project</label>
          <input style={styles.input} value={currentProject} onChange={(e) => setCurrentProject(e.target.value)} placeholder="Project name or blank" />
          <div style={styles.smallNote}>
            Toggle below to mark "No Current Project" which forces Availability to "Available"
          </div>
          <label style={{ marginTop: 8 }}>
            <input type="checkbox" checked={noCurrentProject} onChange={(e) => setNoCurrentProject(e.target.checked)} /> No Current Project
          </label>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Availability</label>
          {noCurrentProject ? (
            <input style={styles.input} value="Available" disabled />
          ) : (
            <select
              style={styles.select}
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            >
              <option value="Partially Available">Partially Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          )}
          <div style={styles.smallNote}>If current project exists, choose Partially Available or Unavailable. Otherwise Availability is Available.</div>
        </div>

        {/* When partially available show hours/dates */}
        {(!noCurrentProject && availability === "Partially Available") && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Hours Available (per day)</label>
              <input style={styles.input} value={hoursAvailable} onChange={(e) => setHoursAvailable(e.target.value)} placeholder="4" />
              {errors.hours && <div style={{ color: "#d32f2f", marginTop: 6 }}>{errors.hours}</div>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>From Date</label>
              <input style={styles.input} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              {errors.fromDate && <div style={{ color: "#d32f2f", marginTop: 6 }}>{errors.fromDate}</div>}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>To Date</label>
              <input style={styles.input} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              {errors.toDate && <div style={{ color: "#d32f2f", marginTop: 6 }}>{errors.toDate}</div>}
            </div>
          </>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Skills (tags)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input id="skillInput" placeholder="Add skill & press Enter" style={styles.input} onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                const val = e.target.value.trim()
                if (val && !skills.includes(val)) {
                  addSkill(val)
                }
                e.target.value = ""
              }
            }} />
            <button type="button" onClick={() => {
              const el = document.getElementById("skillInput")
              if (!el) return
              const val = el.value.trim()
              if (val && !skills.includes(val)) {
                addSkill(val)
              }
              el.value = ""
            }} style={{ padding: "8px 12px", borderRadius: 8, background: "#e8f4ff", border: "1px solid #d7eafa", cursor: "pointer" }}>
              Add
            </button>
          </div>

          <div style={styles.tagRow}>
            {skills.map((s) => (
              <div key={s} style={styles.tag}>
                <span>{s}</span>
                <button onClick={() => removeSkill(s)} style={{ background: "transparent", border: "none", color: "#0b5fa5", fontWeight: 700, cursor: "pointer" }}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Interests (comma separated)</label>
          <input style={styles.input} value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g., Music, Hiking" />
        </div>

        <div style={{ gridColumn: "1 / -1", ...styles.field }}>
          <label style={styles.label}>Previous Projects (one per line)</label>
          <textarea style={styles.textarea} value={previousProjects} onChange={(e) => setPreviousProjects(e.target.value)} placeholder="Project A&#10;Project B" />
        </div>
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={handleSave} style={styles.saveBtn} disabled={saving}>
          {saving ? "Saving..." : "Save details"}
        </button>
      </div>

      {/* hidden uploaded path for tooling transform */}
      <img src="/mnt/data/1f5a4297-e3a9-480d-8a61-27de2e758bdc.png" alt="" style={{ display: "none" }} />
    </div>
  )
}
