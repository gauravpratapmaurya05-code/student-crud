const BASE = "/api/students";

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

// Files must be sent as multipart/form-data (the browser sets the headers itself)
function toFormData({ name, age, roll_no, file }) {
  const fd = new FormData();
  fd.append("name", name);
  fd.append("age", age);
  fd.append("roll_no", roll_no);
  if (file) fd.append("file", file);
  return fd;
}

export const getStudents = () => request(BASE);
export const addStudent = (s) => request(BASE, { method: "POST", body: toFormData(s) });
export const updateStudent = (id, s) => request(`${BASE}/${id}`, { method: "PUT", body: toFormData(s) });
export const deleteStudent = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
