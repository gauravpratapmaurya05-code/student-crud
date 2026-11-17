const BASE = "/api/students";

async function request(url, options) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export const getStudents = () => request(BASE);
export const addStudent = (s) => request(BASE, { method: "POST", body: JSON.stringify(s) });
export const updateStudent = (id, s) => request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(s) });
export const deleteStudent = (id) => request(`${BASE}/${id}`, { method: "DELETE" });
