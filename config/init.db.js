import connectDB from "./db.js";
import Job from "../models/job.model.js";
import Company from "../models/company.model.js";
import dotenv from 'dotenv';
dotenv.config({ path: "../.env" });

const companies = [
    {
    name: "Microsoft",
    careerUrl: "https://apply.careers.microsoft.com/api/pcsx/search?domain=microsoft.com&query=&location=&start=0&sort_by=timestamp&",
    isActive: true,
    lastScraped: null,
    scrapeInterval: 30,
  },
  {
    name: "Amazon",
    careerUrl: "https://www.amazon.jobs/en/search.json?radius=24km&facets%5B%5D=normalized_country_code&facets%5B%5D=normalized_state_name&facets%5B%5D=normalized_city_name&facets%5B%5D=location&facets%5B%5D=business_category&facets%5B%5D=category&facets%5B%5D=schedule_type_id&facets%5B%5D=employee_class&facets%5B%5D=normalized_location&facets%5B%5D=job_function_id&facets%5B%5D=is_manager&facets%5B%5D=is_intern&offset=0&result_limit=10&sort=relevant&latitude=&longitude=&loc_group_id=&loc_query=&base_query=&city=&country=&region=&county=&query_options=&",
    isActive: true,
    lastScraped: null,
    scrapeInterval: 30,
  },
  {
    name: "Netflix",
    careerUrl: "https://explore.jobs.netflix.net/careers",
    isActive: true,
    lastScraped: null,
    scrapeInterval: 30,
  },
]

const initDB = async () => {
    await connectDB();
    await Job.deleteMany({});
    await Company.deleteMany({});
    await Company.insertMany(companies)
    .then(() => {
        console.log("Database initialized with companies");
    }).catch((err) => {
        console.log("Error initializing database", err);
    });
}

initDB();