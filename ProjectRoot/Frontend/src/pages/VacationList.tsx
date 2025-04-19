import React, { useState, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Vacation {
  id: number;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
  followersCount: number;
  isFollowed?: boolean;
}

const VacationList: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [followedOnly, setFollowedOnly] = useState(false);
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch vacations on component mount
    API.get("/vacations")
      .then(res => {
        setVacations(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch vacations:", err);
        // If unauthorized (token expired), force logout
        if (err.response && err.response.status === 401) {
          navigate("/login");
        }
      });
  }, [navigate]);

  // Reset to first page whenever filter criteria change or data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [followedOnly, upcomingOnly, activeOnly, vacations]);

  // Compute filtered vacations based on toggles
  const filteredVacations = vacations.filter(vac => {
    const now = new Date();
    const starts = new Date(vac.startDate);
    const ends = new Date(vac.endDate);
    if (followedOnly && !vac.isFollowed) return false;
    if (upcomingOnly && !(starts > now)) return false;
    if (activeOnly && !(starts <= now && ends >= now)) return false;
    return true;
  });

  // Pagination logic
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVacations.length / itemsPerPage);
  const displayedVacations = filteredVacations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Follow a vacation
  const handleFollow = async (vacationId: number) => {
    try {
      await API.post(`/vacations/${vacationId}/follow`);
      // Update state: mark as followed and increment count
      setVacations(vacations.map(v => {
        if (v.id === vacationId) {
          return { ...v, isFollowed: true, followersCount: v.followersCount + 1 };
        }
        return v;
      }));
    } catch (err) {
      console.error("Follow failed:", err);
    }
  };

  // Unfollow a vacation
  const handleUnfollow = async (vacationId: number) => {
    try {
      await API.delete(`/vacations/${vacationId}/follow`);
      // Update state: mark as not followed and decrement count
      setVacations(vacations.map(v => {
        if (v.id === vacationId) {
          return { ...v, isFollowed: false, followersCount: v.followersCount - 1 };
        }
        return v;
      }));
    } catch (err) {
      console.error("Unfollow failed:", err);
    }
  };

  // Delete a vacation (admin)
  const handleDelete = async (vacationId: number) => {
    const confirm = window.confirm("Are you sure you want to delete this vacation?");
    if (!confirm) return;
    try {
      await API.delete(`/vacations/${vacationId}`);
      // Remove from state list
      setVacations(vacations.filter(v => v.id !== vacationId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Vacations</h2>

      {/* Filter controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {user?.role !== "admin" && (
          <label>
            <input 
              type="checkbox" 
              checked={followedOnly} 
              onChange={e => setFollowedOnly(e.target.checked)} 
              className="mr-1"
            />
            Followed Only
          </label>
        )}
        <label>
          <input 
            type="checkbox" 
            checked={upcomingOnly} 
            onChange={e => setUpcomingOnly(e.target.checked)} 
            className="mr-1"
          />
          Upcoming Only
        </label>
        <label>
          <input 
            type="checkbox" 
            checked={activeOnly} 
            onChange={e => setActiveOnly(e.target.checked)} 
            className="mr-1"
          />
          Active Now
        </label>
      </div>

      {/* Vacation cards list */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayedVacations.map(vac => {
          const starts = new Date(vac.startDate);
          const ends = new Date(vac.endDate);
          const now = new Date();
          // Determine a label for status (for display or style)
          let statusLabel = "";
          if (ends < now) statusLabel = "Past";
          else if (starts > now) statusLabel = "Upcoming";
          else statusLabel = "Active";

          return (
            <div key={vac.id} className="border rounded shadow p-4 flex flex-col">
              <h3 className="text-xl font-semibold mb-2">{vac.destination}</h3>
              <p className="mb-2">{vac.description}</p>
              <p className="mb-1"><strong>Start:</strong> {vac.startDate} &nbsp; <strong>End:</strong> {vac.endDate}</p>
              <p className="mb-1"><strong>Price:</strong> ${Number(vac.price).toFixed(2)}</p>
              <p className="mb-2"><strong>Followers:</strong> {vac.followersCount}</p>
              <p className={`mb-2 font-semibold ${statusLabel === "Active" ? "text-green-600" : statusLabel === "Upcoming" ? "text-blue-600" : "text-gray-500"}`}>
                Status: {statusLabel}
              </p>
              {user?.role === "admin" ? (
                // Admin controls: Edit / Delete
                <div className="mt-auto pt-2">
                  <button 
                    onClick={() => navigate(`/editVacation/${vac.id}`)} 
                    className="mr-3 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(vac.id)} 
                    className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                // User controls: Follow / Unfollow
                <div className="mt-auto pt-2">
                  {vac.isFollowed ? (
                    <button 
                      onClick={() => handleUnfollow(vac.id)} 
                      className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleFollow(vac.id)} 
                      className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Follow
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination controls */}
      {filteredVacations.length > 0 && (
        <div className="mt-6 text-center">
          <button onClick={goToPrevPage} disabled={currentPage === 1} className="px-3 py-1 border rounded mr-2 disabled:opacity-50">
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-3 py-1 border rounded ml-2 disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default VacationList;
