import { useState, useEffect } from "react"
import EmployeeCard from "../components/EmployeeCard"
import { API_URL } from "../config"

export default function HomeScreen({ onLogout, onProfile, employee }) {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/employees`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch employees`)
      }

      const data = await response.json()
      setEmployees(data)
      setFilteredEmployees(data)
      setError("")
    } catch (err) {
      setError(`Failed to load employees: ${err.message}. Make sure backend is running on ${API_URL}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = employees

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter((emp) =>
        (emp.name && emp.name.toLowerCase().includes(lowerSearch)) ||
        (emp.current_skills && emp.current_skills.some((skill) => skill.toLowerCase().includes(lowerSearch))) ||
        (emp.location && emp.location.toLowerCase().includes(lowerSearch)) ||
        (emp.role && emp.role.toLowerCase().includes(lowerSearch))
      )
    }

    if (availabilityFilter !== "All") {
      filtered = filtered.filter((emp) => emp.availability === availabilityFilter)
    }

    setFilteredEmployees(filtered)
  }, [searchTerm, availabilityFilter, employees])

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  const styles = {
    container: {
      padding: "15px",
      fontFamily: "Segoe UI, Tahoma, sans-serif",
      background: "#f5f5f5",
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "#0072bc",
      color: "white",
      padding: "15px 20px",
      borderRadius: "8px",
      marginBottom: "20px",
      flexWrap: "wrap",
      gap: "10px",
    },
    title: { margin: 0, fontSize: "24px", fontWeight: "600" },
    menu: { display: "flex", gap: "10px", alignItems: "center" },
    iconButton: {
      background: "white",
      color: "#0072bc",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      cursor: "pointer",
      fontSize: "20px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    logoutButton: {
      background: "#d32f2f",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "10px 16px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px",
    },
    controls: {
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    searchBox: {
      display: "flex",
      gap: "10px",
      marginBottom: "15px",
      flexWrap: "wrap",
    },
    input: {
      flex: 1,
      minWidth: "200px",
      padding: "10px 12px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "14px",
      fontFamily: "inherit",
    },
    select: {
      padding: "10px 12px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "14px",
      fontFamily: "inherit",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "20px",
    },
    noResults: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#999",
      fontSize: "16px",
    },
    errorBox: {
      background: "#ffebee",
      color: "#d32f2f",
      padding: "15px",
      borderRadius: "8px",
      marginBottom: "20px",
      fontSize: "14px",
    },
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.noResults}>Loading employees...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Employee Dashboard</h1>
        <div style={styles.menu}>
          <button style={styles.iconButton} onClick={onProfile} title="Profile">
            👤
          </button>
          <button style={styles.logoutButton} onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <input
            style={styles.input}
            type="text"
            placeholder="Search by name, skill, location or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            style={styles.select}
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Partially Available">Partially Available</option>
          </select>
        </div>
      </div>

      <div style={styles.grid}>
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.empid} employee={emp} getInitials={getInitials} />
          ))
        ) : (
          <div style={styles.noResults}>
            {employees.length === 0 ? "No employees available" : "No employees match your search"}
          </div>
        )}
      </div>
    </div>
  )}
