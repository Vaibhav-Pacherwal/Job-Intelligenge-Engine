import { chromium } from 'playwright';
import Job from '../models/job.model.js';
import Company from '../models/company.model.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

let browser;
const amazonScraper = async () => {
    try {
        browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();
        await connectDB();

        const company = await Company.findOne({ name: "Amazon" });

        let offset = 0;
        while(true) {
            const response_1 = await page.request.get(
                `https://www.amazon.jobs/en/search.json?radius=24km&facets%5B%5D=normalized_country_code&facets%5B%5D=normalized_state_name&facets%5B%5D=normalized_city_name&facets%5B%5D=location&facets%5B%5D=business_category&facets%5B%5D=category&facets%5B%5D=schedule_type_id&facets%5B%5D=employee_class&facets%5B%5D=normalized_location&facets%5B%5D=job_function_id&facets%5B%5D=is_manager&facets%5B%5D=is_intern&offset=${offset}&result_limit=10&sort=relevant&latitude=&longitude=&loc_group_id=&loc_query=&base_query=&city=&country=&region=&county=&query_options=&`
            );
            if (!response_1.ok()) {
                console.log(`Search API failed: ${response_1.status()}`);
                console.log(await response_1.text());   
                if (response_1.status() === 429) {
                    console.log("Rate limited. Waiting 60 seconds...");
                    await page.waitForTimeout(60000);
                    continue;
                }   
                break;
            }
            const jsonResponse_1 = await response_1.json();
            const positions = jsonResponse_1.jobs;
            if(!positions || positions.length === 0) {
                console.log("No more positions found. Exiting loop.");
                break;
            }   
            
            const ids = positions.map(position => position.id_icims);
            const existingJobs = await Job.find({ externalJobId: { $in: ids }}).select("externalJobId");
            const existingJobIds = new Set(
                existingJobs.map(job => job.externalJobId)
            );

            const jobs = [];
            for(const position of positions) {
                if(existingJobIds.has(position.id_icims)) {
                    continue;
                };

                jobs.push({
                    company: company._id,
                    externalJobId: position.id_icims,
                    role: position.title,
                    department: position.department,
                    location: position.normalized_location,
                    description: position.description,
                    jobUrl: `https://www.amazon.jobs${position.job_path}`,
                    listedOn: new Date(position.posted_date),
                });
            }
            await Job.insertMany(jobs, { ordered: false })
            .then(() => {
                console.log(`Scraped positions from Amazon starting at index ${offset}`);
            }).catch((error) => {
                console.error("Error occurred while saving job:", error);
            });

            offset += 10;
        }
    } catch(error) {
        console.log("Error occurred while launching browser:", error);
    } finally {
        if(browser) {
            await browser.close();
            console.log("Browser closed");
        }
    }
}

amazonScraper()

export default amazonScraper;