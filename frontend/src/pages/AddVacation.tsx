import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const AddVacation: React.FC = () => {
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("destination", destination);
    formData.append("description", description);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("price", price);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    try {
      await API.post("/vacations", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/vacations");
    } catch (err: unknown) {
      console.error("Add vacation failed:", err);
      if (err instanceof Error && (err as any).response?.data?.message) {
        setError((err as any).response.data.message);
      } else {
        setError("Failed to add vacation.");
      }
    }
  };

  // For client-side date validation: ensure endDate min is startDate, and startDate min is today
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-white shadow-md rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Vacation</h2>
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
            min={todayStr}
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
          <input 
            type="file" 
            className="block w-full mt-1"
            accept="image/*"
            onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
            required 
          />
        </label>
        <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
          Add Vacation
        </button>
      </form>
    </div>
  );
};

export default AddVacation;
