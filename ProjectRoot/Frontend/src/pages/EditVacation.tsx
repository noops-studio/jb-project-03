import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const EditVacation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [currentImageName, setCurrentImageName] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch existing vacation data
  useEffect(() => {
    if (!id) return;
    API.get(`/vacations/${id}`)
      .then(res => {
        const vac = res.data;
        setDestination(vac.destination);
        setDescription(vac.description);
        setStartDate(vac.startDate?.slice(0, 10));  // slice to get YYYY-MM-DD
        setEndDate(vac.endDate?.slice(0, 10));
        setPrice(String(vac.price));
        setCurrentImageName(vac.imageFileName);
      })
      .catch(err => {
        console.error("Failed to load vacation:", err);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!id) return;
    const formData = new FormData();
    formData.append("destination", destination);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("price", price);
    if (newImageFile) {
      formData.append("image", newImageFile);
    }
    try {
      await API.put(`/vacations/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/vacations");
    } catch (err: any) {
      console.error("Edit vacation failed:", err);
      setError(err.response?.data?.message || "Failed to update vacation.");
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Vacation</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Destination:
          <input 
            type="text" 
            className="block w-full border rounded px-3 py-1 mt-1"
            value={destination}
            onChange={e => setDestination(e.target.value)}
            required 
          />
        </label>
        <label className="block mb-2">
          Description:
          <textarea 
            className="block w-full border rounded px-3 py-1 mt-1"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required 
          />
        </label>
        <label className="block mb-2">
          Start Date:
          <input 
            type="date" 
            className="block w-full border rounded px-3 py-1 mt-1"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required 
            /* Allow past dates because editing past vacations is allowed */
            min={todayStr /* optional: you may allow past, remove min if needed */}
          />
        </label>
        <label className="block mb-2">
          End Date:
          <input 
            type="date" 
            className="block w-full border rounded px-3 py-1 mt-1"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required 
            min={startDate || todayStr}
          />
        </label>
        <label className="block mb-2">
          Price (USD):
          <input 
            type="number" 
            className="block w-full border rounded px-3 py-1 mt-1"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required 
            min={0}
            max={10000}
            step="0.01"
          />
        </label>
        <label className="block mb-4">
          Image:
          {currentImageName && (
            <div className="mb-2 text-sm">
              Current image file: <span className="italic">{currentImageName}</span>
            </div>
          )}
          <input 
            type="file" 
            className="block w-full"
            accept="image/*"
            onChange={e => setNewImageFile(e.target.files ? e.target.files[0] : null)}
          />
          <small className="text-gray-600">Leave blank to keep current image</small>
        </label>
        <button type="submit" className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600">
          Update Vacation
        </button>
      </form>
    </div>
  );
};

export default EditVacation;
