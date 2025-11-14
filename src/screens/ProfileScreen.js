import { useState, useEffect } from "react";
import { API_URL } from "../config";

export default function ProfileScreen({ employee, onBack }) {
  const allSkills = [
    "JavaScript",
    "Python",
    "Java",
    "C#",
    "C++",
    "Go",
    "Ruby",
    "TypeScript",
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "SQL",
    "NoSQL",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "GraphQL",
    "REST APIs",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "Git",
    "HTML",
    "CSS",
    "SASS",
    "Bootstrap",
    "Material-UI",
    "Figma",
    "UI/UX Design",
    "Machine Learning",
    "Deep Learning",
    "AI",
    "Data Science",
    "Power BI",
    "Tableau",
    "Project Management",
    "Agile",
    "Scrum",
    "Testing",
    "Selenium",
    "Aerospace",
    "Embedded Systems",
    "IoT",
    "Cybersecurity",
    "Blockchain",
    "DevOps",
    "Salesforce",
    "ERP",
    "Leadership",
    "Communication",
    "Problem Solving",
  ];

  const availabilityOptions = [
    "Available",
    "Unavailable",
    "Partially Available",
  ];
  const hoursOptions = [1, 2, 4, 6, 8];

  const [empid, setEmpid] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState("Unavailable");
  const [hours, setHours] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [interests, setInterests] = useState("");
  const [projects, setProjects] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!employee || !employee.empid) return;

      try {
        const response = await fetch(
          `${API_URL}/api/employees/${employee.empid}`
        );
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        console.log("[v0] Full profile fetched:", data);

        const formatDate = (dateStr) => {
          if (!dateStr) return "";
          return dateStr.split("T")[0]; // Extract YYYY-MM-DD from '2025-12-09T18:30:00.000Z'
        };

        setEmpid(data.empid || "");
        setName(data.name || "");
        setEmail(data.email || "");
        setRole(data.role || "");
        setLocation(data.location || "");
        setAvailability(data.availability || "Unavailable");
        setHours(data.hours_available || "");
        setFromDate(formatDate(data.from_date));
        setToDate(formatDate(data.to_date));

        setInterests(
          Array.isArray(data.interests) ? data.interests.join(", ") : ""
        );
        setProjects(
          Array.isArray(data.previous_projects)
            ? data.previous_projects.join("\n")
            : ""
        );
        setSkills(
          Array.isArray(data.current_skills) ? data.current_skills : []
        );
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Unable to load profile. Please try again.");
      }
    };

    fetchProfile();
  }, [employee]);

  const addSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput("");
    setFilteredSkills([]);
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    if (value.length > 0) {
      const filtered = allSkills.filter(
        (s) =>
          s.toLowerCase().includes(value.toLowerCase()) && !skills.includes(s)
      );
      setFilteredSkills(filtered);
    } else {
      setFilteredSkills([]);
    }
  };

  const handleSave = async () => {
    setError("");

    if (
      availability === "Partially Available" &&
      (!hours || !fromDate || !toDate)
    ) {
      setError(
        "Hours, From Date, and To Date are required for Partially Available"
      );
      return;
    }

    setLoading(true);
    try {
      const projectsArray = projects.split("\n").filter((p) => p.trim());
      const interestsArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const response = await fetch(
        `${API_URL}/api/employees/${employee.empid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            availability,
            hours_available:
              availability === "Partially Available"
                ? Number.parseInt(hours)
                : null,
            from_date: availability === "Partially Available" ? fromDate : null,
            to_date: availability === "Partially Available" ? toDate : null,
            current_skills: skills,
            interests: interestsArray,
            previous_projects: projectsArray,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Update failed");
      }

      alert("Profile saved successfully!");
      onBack();
    } catch (err) {
      setError(err.message);
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "700px",
      margin: "20px auto",
      fontFamily: "Segoe UI, Tahoma, sans-serif",
      padding: "20px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      color: "#333",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    title: { margin: 0, fontSize: "24px", color: "#0072bc", fontWeight: "600" },
    backButton: {
      cursor: "pointer",
      padding: "8px 16px",
      background: "#0072bc",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontWeight: "bold",
    },
    label: {
      display: "block",
      margin: "15px 0 6px",
      fontWeight: "600",
      fontSize: "14px",
      color: "#333",
    },
    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "14px",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    select: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      fontSize: "14px",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      borderRadius: "6px",
      border: "1px solid #ddd",
      minHeight: "80px",
      fontSize: "14px",
      resize: "vertical",
      boxSizing: "border-box",
      fontFamily: "inherit",
    },
    saveButton: {
      marginTop: "20px",
      padding: "12px",
      width: "100%",
      background: "#0072bc",
      color: "white",
      border: "none",
      borderRadius: "6px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
      opacity: loading ? 0.7 : 1,
    },
    skillsDropdownContainer: { position: "relative", marginBottom: "10px" },
    filteredList: {
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      background: "white",
      border: "1px solid #ddd",
      maxHeight: "150px",
      overflowY: "auto",
      borderRadius: "6px",
      zIndex: 10,
    },
    skillItem: {
      padding: "8px 12px",
      cursor: "pointer",
      borderBottom: "1px solid #eee",
    },
    skillTagContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      marginTop: "8px",
    },
    skillTag: {
      background: "#4caf50",
      color: "white",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "13px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    error: {
      color: "#d32f2f",
      marginBottom: "15px",
      padding: "10px",
      background: "#ffebee",
      borderRadius: "6px",
      fontSize: "14px",
    },
    conditionalInfo: {
      background: "#e3f2fd",
      padding: "10px",
      borderRadius: "6px",
      marginBottom: "15px",
      fontSize: "13px",
      color: "#0072bc",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Profile</h2>
        <button style={styles.backButton} onClick={onBack}>
          Back
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <label style={styles.label}>Employee ID</label>
      <input style={styles.input} type="text" value={empid} disabled />

      <label style={styles.label}>Name</label>
      <input style={styles.input} type="text" value={name} disabled />

      <label style={styles.label}>Email</label>
      <input style={styles.input} type="email" value={email} disabled />

      <label style={styles.label}>Role</label>
      <input style={styles.input} type="text" value={role} disabled />

      <label style={styles.label}>Location</label>
      <input style={styles.input} type="text" value={location} disabled />

      <label style={styles.label}>Availability</label>
      <select
        style={styles.select}
        value={availability}
        onChange={(e) => setAvailability(e.target.value)}
        disabled={loading}
      >
        {availabilityOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {availability === "Partially Available" && (
        <>
          <div style={styles.conditionalInfo}>
            These fields are for Partially Available status only
          </div>

          <label style={styles.label}>Hours Available</label>
          <select
            style={styles.select}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            disabled={loading}
          >
            <option value="">Select hours</option>
            {hoursOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} hours
              </option>
            ))}
          </select>

          <label style={styles.label}>From Date</label>
          <input
            style={styles.input}
            type="date"
            value={fromDate}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              if (
                selectedDate >= today &&
                selectedDate.getDay() !== 0 &&
                selectedDate.getDay() !== 6
              ) {
                setFromDate(e.target.value);
                // Reset toDate if it's now invalid
                const toDateObj = new Date(toDate);
                if (
                  toDateObj < selectedDate ||
                  toDateObj >
                    new Date(
                      selectedDate.getFullYear() + 1,
                      selectedDate.getMonth(),
                      selectedDate.getDate()
                    ) ||
                  toDateObj.getDay() === 0 ||
                  toDateObj.getDay() === 6
                ) {
                  setToDate("");
                }
              }
            }}
            disabled={loading}
          />

          <label style={styles.label}>To Date</label>
          <input
            style={styles.input}
            type="date"
            value={toDate}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const fromDateObj = new Date(fromDate);
              const maxDate = new Date(fromDateObj);
              maxDate.setFullYear(maxDate.getFullYear() + 1);

              if (
                selectedDate >= fromDateObj &&
                selectedDate <= maxDate &&
                selectedDate.getDay() !== 0 &&
                selectedDate.getDay() !== 6
              ) {
                setToDate(e.target.value);
              }
            }}
            disabled={loading || !fromDate}
          />
        </>
      )}

      <label style={styles.label}>Interests (comma-separated)</label>
      <textarea
        style={styles.textarea}
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        disabled={loading}
        placeholder="e.g., Music, Gaming, Hiking, Photography"
      />

      <label style={styles.label}>Add Skills</label>
      <div style={styles.skillsDropdownContainer}>
        <input
          style={styles.input}
          type="text"
          placeholder="Type to search skills..."
          value={skillInput}
          onChange={handleSkillInputChange}
          disabled={loading}
        />
        {filteredSkills.length > 0 && (
          <div style={styles.filteredList}>
            {filteredSkills.map((s) => (
              <div key={s} style={styles.skillItem} onClick={() => addSkill(s)}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div style={styles.skillTagContainer}>
          {skills.map((s) => (
            <div key={s} style={styles.skillTag}>
              {s}{" "}
              <span
                style={{ cursor: "pointer", fontWeight: "bold" }}
                onClick={() => removeSkill(s)}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      <label style={styles.label}>Previous Projects (one per line)</label>
      <textarea
        style={styles.textarea}
        value={projects}
        onChange={(e) => setProjects(e.target.value)}
        disabled={loading}
      />

      <button style={styles.saveButton} onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
