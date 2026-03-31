const fetch = require("node-fetch");
const saveJobs = require("./saveJobs");

const fetchJobs = async () => {
  try {
    console.log("⏳ Fetching jobs from API...");

    const url = "https://jsearch.p.rapidapi.com/search?query=developer jobs in india&page=1&num_pages=1";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPID_API_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com"
      }
    });

    const data = await response.json();

    console.log("✅ API Data Fetched");

    await saveJobs(data);

  } catch (err) {
    console.log("❌ Job fetch error:", err.message);
  }
};

module.exports = fetchJobs;