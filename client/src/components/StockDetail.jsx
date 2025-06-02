import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StockDetail.css";
import StockSearch from "./StockSearch";
import { CgLogOut } from "react-icons/cg";
import { FaUserCircle } from "react-icons/fa";
import Navbar from "./Navbar";

// Reusable component for loading and error states
const StockDetailLayout = ({ children, loading, error, stockData }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  if (loading) {
    return (
      <div className="dashboard-root">
        <Navbar />
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="search-container">
              <StockSearch />
            </div>
            <div className="dashboard-topbar-icons">
              <CgLogOut className="logout-icon" onClick={handleLogout} />
              <FaUserCircle
                className="profile-icon"
                onClick={() => navigate("/profile")}
              />
            </div>
          </header>
          <div className="loading">Loading stock data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-root">
        <Navbar />
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="search-container">
              <StockSearch />
            </div>
            <div className="dashboard-topbar-icons">
              <CgLogOut className="logout-icon" onClick={handleLogout} />
              <FaUserCircle
                className="profile-icon"
                onClick={() => navigate("/profile")}
              />
            </div>
          </header>
          <div className="error">{error}</div>
        </main>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="dashboard-root">
        <Navbar />
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="search-container">
              <StockSearch />
            </div>
            <div className="dashboard-topbar-icons">
              <CgLogOut className="logout-icon" onClick={handleLogout} />
              <FaUserCircle
                className="profile-icon"
                onClick={() => navigate("/profile")}
              />
            </div>
          </header>
          <div className="error">No data available for this stock</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <Navbar />
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="search-container">
            <StockSearch />
          </div>
          <div className="dashboard-topbar-icons">
            <CgLogOut className="logout-icon" onClick={handleLogout} />
            <FaUserCircle
              className="profile-icon"
              onClick={() => navigate("/profile")}
            />
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [buyError, setBuyError] = useState("");
  const [buySuccess, setBuySuccess] = useState("");

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(`http://localhost:8080/api/${symbol}`);
        const response = await axios.get(
          `http://localhost:8080/api/stocks/${symbol}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStockData(response.data);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError("Failed to fetch stock data");
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  const handleBuyStock = async (e) => {
    e.preventDefault();
    setBuyError("");
    setBuySuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/holdings",
        {
          stockSymbol: symbol,
          stockPrice: stockData.price,
          stockQuantity: quantity,
          action: "buy",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBuySuccess("Successfully bought stocks!");
      // Clear success message after 2 seconds
      setTimeout(() => {
        setBuySuccess("");
      }, 2000);

      //reroute to the home page
      navigate("/");
      setQuantity(1);
    } catch (err) {
      console.error("Error buying stock:", err);
      setBuyError(err.response?.data?.message || "Failed to buy stock");
      // Clear error message after 2 seconds
      setTimeout(() => {
        setBuyError("");
      }, 2000);
    }
  };

  return (
    <StockDetailLayout loading={loading} error={error} stockData={stockData}>
      <div className="stock-detail-content">
        <div className="stock-header">
          <h1>{stockData.symbol}</h1>
          <h2>{stockData.description}</h2>
        </div>

        <div className="stock-price-section">
          <div className="current-price">
            <span className="price-label">Current Price</span>
            <span className="price-value">${stockData.price.toFixed(2)}</span>
          </div>
          <div className="price-change">
            <span
              className={`change-value ${
                stockData.change >= 0 ? "positive" : "negative"
              }`}
            >
              {stockData.change >= 0 ? "+" : ""}
              {stockData.change.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="stock-details-grid">
          <div className="detail-card">
            <h3>Market Cap</h3>
            <p>${stockData.marketCap.toLocaleString()}</p>
          </div>
          <div className="detail-card">
            <h3>Volume</h3>
            <p>{stockData.volume.toLocaleString()}</p>
          </div>
        </div>

        <div className="buy-stock-section">
          <h3>Buy {stockData.symbol}</h3>
          <form onSubmit={handleBuyStock}>
            <div className="form-group">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setQuantity("");
                  } else {
                    const parsedValue = parseInt(value);
                    setQuantity(parsedValue >= 1 ? parsedValue : 1);
                  }
                }}
              />
            </div>
            <div className="total-cost">
              Total Cost: ${(stockData.price * quantity).toFixed(2)}
            </div>
            {buyError && <div className="error-message">{buyError}</div>}
            {buySuccess && <div className="success-message">{buySuccess}</div>}
            <button type="submit" className="buy-button">
              Buy Stock
            </button>
          </form>
        </div>
      </div>
    </StockDetailLayout>
  );
};

export default StockDetail;
