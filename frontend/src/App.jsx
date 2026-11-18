import { useEffect, useState } from "react";
import { getStudents, addStudent, updateStudent, deleteStudent } from "./api";

const emptyForm = { name: "", age: "", roll_no: "" };

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0); // changing this clears the file input
  const [editingId, setEditingId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setStudents(await getStudents());
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setFileInputKey((k) => k + 1);
    setEditingId(null);
    setCurrentFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) await updateStudent(editingId, { ...form, file });
      else await addStudent({ ...form, file });
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setEditingId(s.id);
    setForm({ name: s.name, age: s.age, roll_no: s.roll_no });
    setFile(null);
    setFileInputKey((k) => k + 1);
    setCurrentFileName(s.file_name || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    resetForm();
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await deleteStudent(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page">
      <h1>Student records</h1>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} placeholder="Aarav Sharma" />
        </label>
        <label>
          Age
          <input name="age" type="number" min="1" value={form.age} onChange={handleChange} placeholder="18" />
        </label>
        <label>
          Roll no.
          <input name="roll_no" value={form.roll_no} onChange={handleChange} placeholder="CS-101" />
        </label>
        <label className="file-field">
          File (PNG, JPG, GIF, PDF or DOCX, max 5 MB)
          <input
            key={fileInputKey}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.pdf,.docx"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          {editingId && currentFileName && (
            <span className="hint">Current file: {currentFileName}. Choose a new one to replace it.</span>
          )}
        </label>
        <div className="actions">
          <button type="submit" className="primary" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Add student"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {students.length === 0 ? (
        <p className="empty">No students yet. Add the first one above.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Roll no.</th>
                <th>Name</th>
                <th>Age</th>
                <th>File</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.roll_no}</td>
                  <td>{s.name}</td>
                  <td>{s.age}</td>
                  <td>
                    {s.file_url ? (
                      <a href={s.file_url} target="_blank" rel="noreferrer">
                        {s.file_name}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="row-actions">
                    <button onClick={() => handleEdit(s)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
