import React, { useEffect, useState, useRef } from "react"
import { API_URL } from "../config"

/**
 * ProfileScreen (Updated)
 * - Edits only: name, empid, email, role, otherRole, cluster, location
 * - Updates ONLY these fields in DB using original employee id (originalIdRef)
 * - Will not overwrite detail fields (DetailScreen owns those)
 */

export default function ProfileScreen({ employee = null, onBack, onSaveProfile }) {
  const ROLE = [
    { label: "Software Developer", value: "Software Developer" },
    { label: "Engagement Manager", value: "Engagement Manager" },
    { label: "Tech Lead", value: "Tech Lead" },
    { label: "Data Analyst", value: "Data Analyst" },
    { label: "Consulting - PLM", value: "Consulting - PLM" },
    { label: "Consulting - Manufacturing", value: "Consulting - Manufacturing" },
    { label: "Consulting - Aerospace", value: "Consulting - Aerospace" },
    { label: "Head of Bluebird", value: "Head of Bluebird" },
    { label: "Aerospace role", value: "Aerospace role" },
    { label: "Presentation role", value: "Presentation role" },
    { label: "Other", value: "Other" },
  ]

  const CLUSTER = [
    { label: "MEBM", value: "MEBM" },
    { label: "M&T", value: "M&T" },
    { label: "PLM", value: "PLM" },
  ]

  const [empid, setEmpid] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [otherRole, setOtherRole] = useState("")
  const [cluster, setCluster] = useState("")
  const [location, setLocation] = useState("")

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState({})

  const originalIdRef = useRef(null)

  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 900 : false)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900)
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Initialize from prop
  useEffect(() => {
    if (!employee) return
    const original = employee.empid || employee.id || ""
    originalIdRef.current = original

    setEmpid(original)
    setName(employee.name || "")
    setEmail(employee.email || "")
    setRole(employee.role || "")
    setOtherRole(employee.otherRole || employee.other_role || "")
    setCluster(employee.cluster || "")
    setLocation(employee.location || "")
  }, [employee])

  // Non-destructive background refresh (only fill empty local fields)
  useEffect(() => {
    const id = originalIdRef.current
    if (!id) return
    const url = `${API_URL.replace(/\/$/, "")}/api/employees/${encodeURIComponent(id)}`
    ;(async () => {
      try {
        const res = await fetch(url, { headers: { "Content-Type": "application/json" } })
        if (!res.ok) return
        const data = await res.json()
        const obj = Array.isArray(data) ? data[0] : data
        if (!obj) return

        setName((cur) => (cur ? cur : obj.name || ""))
        setEmail((cur) => (cur ? cur : obj.email || ""))
        setRole((cur) => (cur ? cur : obj.role || ""))
        setOtherRole((cur) => (cur ? cur : obj.otherRole || obj.other_role || ""))
        setCluster((cur) => (cur ? cur : obj.cluster || ""))
        setLocation((cur) => (cur ? cur : obj.location || ""))
      } catch (e) {
        console.warn("Profile refresh failed:", e)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee])

  // Validation
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  const errors = {
    name: !name.trim() ? "Name is required" : "",
    empid: !empid.toString().trim() ? "Employee Id required" : "",
    email: !validateEmail(email) ? "Valid email required" : "",
    role: !role ? "Role required" : "",
    otherRole: role === "Other" && !otherRole.trim() ? "Enter role" : "",
    cluster: !cluster ? "Cluster required" : "",
  }
  const onBlurField = (k) => setTouched((t) => ({ ...t, [k]: true }))
  const isValid = () => !Object.values(errors).some(Boolean)

  // Read response utility
  const readResponse = async (res) => {
    const ct = res.headers.get("content-type") || ""
    try {
      if (ct.includes("application/json")) return await res.json()
      return await res.text()
    } catch {
      return "<unreadable response>"
    }
  }

  const fetchServerRecord = async (id) => {
    const base = API_URL.replace(/\/$/, "")
    const url = `${base}/api/employees/${encodeURIComponent(id)}`
    try {
      const r = await fetch(url, { headers: { "Content-Type": "application/json" } })
      if (r.ok) {
        const d = await r.json()
        return Array.isArray(d) ? d[0] : d
      }
    } catch (e) {
      // ignore and fallback
    }

    // fallback to fetch all and find
    try {
      const list = await fetch(`${base}/api/employees`, { headers: { "Content-Type": "application/json" } })
      if (!list.ok) return null
      const arr = await list.json()
      if (!Array.isArray(arr)) return null
      return arr.find((x) => ((x.empid || x.id) + "") === (id + "")) || null
    } catch (e) {
      return null
    }
  }

  const handleSave = async () => {
    setTouched({ name: true, empid: true, email: true, role: true, otherRole: true, cluster: true })
    setError("")

    if (!isValid()) return setError("Fix errors before saving.")

    const originalId = originalIdRef.current
    if (!originalId) return setError("Missing original employee ID.")

    setSaving(true)

    try {
      const payload = {
        name: name.trim(),
        empid: empid.toString().trim(),
        email: email.trim(),
        role: role === "Other" ? otherRole.trim() : role,
        otherRole: role === "Other" ? otherRole.trim() : "",
        cluster,
        location: location.trim(),
      }

      const base = API_URL.replace(/\/$/, "")
      const target = `${base}/api/employees/${encodeURIComponent(originalId)}`

      console.log("[ProfileScreen] payload ->", payload, "target ->", target)

      // Try PUT
      let res = await fetch(target, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      let body = await readResponse(res)
      console.log("[ProfileScreen] PUT", res.status, body)

      // PATCH fallback
      if (!res.ok) {
        console.warn("[ProfileScreen] PUT failed; trying PATCH")
        res = await fetch(target, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        body = await readResponse(res)
        console.log("[ProfileScreen] PATCH", res.status, body)
      }

      // POST fallback to collection
      if (!res.ok) {
        console.warn("[ProfileScreen] PATCH failed; trying POST to collection endpoint")
        const postRes = await fetch(`${base}/api/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empid: payload.empid, ...payload }),
        })
        const postBody = await readResponse(postRes)
        console.log("[ProfileScreen] POST", postRes.status, postBody)
        if (!postRes.ok) throw new Error(`All update attempts failed. Last status: ${postRes.status}`)
      }

      // Confirm by fetching server record (prefer new empid then original)
      let serverRecord = await fetchServerRecord(payload.empid)
      if (!serverRecord) serverRecord = await fetchServerRecord(originalId)
      if (!serverRecord) throw new Error("Could not fetch record after save — check backend.")

      // Build profile-only object using serverRecord fields (non-destructive)
      const profileKeys = ["empid", "name", "email", "role", "otherRole", "cluster", "location"]
      const profileOnly = {}
      for (const k of profileKeys) {
        profileOnly[k] =
          serverRecord[k] ?? serverRecord[k.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase())] ?? ""
      }

      // Merge into sessionStorage safely (only profile keys)
      try {
        const existing = JSON.parse(sessionStorage.getItem("user") || "{}")
        sessionStorage.setItem("user", JSON.stringify({ ...existing, ...profileOnly }))
      } catch (e) {
        console.warn("sessionStorage merge failed:", e)
      }

      onSaveProfile && onSaveProfile(profileOnly)
      alert("Profile updated and confirmed on server.")
    } catch (err) {
      console.error("[ProfileScreen] Save error:", err)
      setError(err.message || "Save failed — check console/network")
      alert(`Save failed: ${err.message}. See console/network tab.`)
    } finally {
      setSaving(false)
    }
  }

  const styles = {
    container: {
      maxWidth: 920,
      margin: "18px auto",
      padding: isMobile ? 14 : 20,
      fontFamily: "Segoe UI, Tahoma",
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
    },
    headerRow: { display: "flex", gap: 16, alignItems: "center", marginBottom: 14 },
    backBtn: { padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", cursor: "pointer" },
    formRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 },
    field: { display: "flex", flexDirection: "column" },
    label: { fontSize: 13, marginBottom: 4 },
    input: { padding: 10, borderRadius: 8, border: "1px solid #ddd" },
    select: { padding: 10, borderRadius: 8, border: "1px solid #ddd" },
    errorBox: { background: "#fee", padding: 10, borderRadius: 8, color: "#b00" },
    actions: { display: "flex", justifyContent: "flex-end", marginTop: 18 },
    saveBtn: { padding: "10px 16px", borderRadius: 10, background: "#0072bc", color: "#fff", border: "none", cursor: "pointer" },
  }

  return (
    <div style={styles.container} role="region" aria-label="Profile screen">
      <div style={styles.headerRow}>
        <button style={styles.backBtn} onClick={() => onBack && onBack()}>← Back</button>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>Profile</div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.formRow}>
        <div style={styles.field}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => onBlurField("name")}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Employee ID</label>
          <input
            style={styles.input}
            value={empid}
            onChange={(e) => setEmpid(e.target.value)}
            onBlur={() => onBlurField("empid")}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => onBlurField("email")}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Role</label>
          <select style={styles.select} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select role</option>
            {ROLE.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {role === "Other" && (
          <div style={styles.field}>
            <label style={styles.label}>Specify Role</label>
            <input style={styles.input} value={otherRole} onChange={(e) => setOtherRole(e.target.value)} />
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Cluster</label>
          <select style={styles.select} value={cluster} onChange={(e) => setCluster(e.target.value)}>
            <option value="">Select cluster</option>
            {CLUSTER.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Location</label>
          <input style={styles.input} value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</button>
      </div>
    </div>
  )
}
