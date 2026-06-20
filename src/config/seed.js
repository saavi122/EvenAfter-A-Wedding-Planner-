import mongoose from "mongoose";
import User from "../models/user.models.js";
import Planner from "../models/planner.models.js";
import Client from "../models/client.models.js";
import Portfolio from "../models/portfolio.models.js";
import Review from "../models/review.models.js";
import EventHistory from "../models/eventHistory.models.js";
import Vendor from "../models/vendor.models.js";
import ShortlistedVendor from "../models/shortlistedVendor.models.js";
import VendorAssignment from "../models/vendorAssignment.models.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const seedData = async () => {
    try {
        console.log("Connecting to database for seeding...");
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        console.log("Database connected. Clearing existing data...");

        // Clear existing collections
        await User.deleteMany({});
        await Planner.deleteMany({});
        await Client.deleteMany({});
        await Portfolio.deleteMany({});
        await Review.deleteMany({});
        await EventHistory.deleteMany({});
        await Vendor.deleteMany({});
        await ShortlistedVendor.deleteMany({});
        await VendorAssignment.deleteMany({});

        console.log("Password encryption in progress...");
        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash("password123", salt);

        // 1. Create a Seed Client
        const clientUser = await User.create({
            name: "Sarah Miller",
            email: "client@example.com",
            phoneNo: "9876543210",
            password: defaultPassword,
            role: "client"
        });

        const clientProfile = await Client.create({
            name: clientUser._id,
            email: clientUser._id,
            clientRole: clientUser._id,
            userId: clientUser._id,
            EventIdName: "Sarah & David's Royal Wedding",
            venue: "Umaid Bhawan Palace, Jodhpur",
            budget: 7500000,
            timelineAccess: "Granted",
            clientId: "CLI-492710",
            partnerName: "David Jenkins",
            weddingDate: new Date("2026-12-18"),
            location: "Jodhpur, Rajasthan",
            address: "Penthouse 4B, Colaba, Mumbai",
            weddingStatus: "Planning"
        });

        console.log("Client created successfully.");

        // 2. Create Planners
        const plannersData = [
            {
                name: "Pankaj Sharma",
                email: "pankaj@example.com",
                phoneNo: "9812345670",
                companyName: "Pankaj Sharma Weddings & Events",
                specialiazation: "Destination Weddings, Royal Weddings, Luxury Events",
                assignedEvents: "250+",
                exprience: "8+ Years",
                ratings: 5.0,
                status: "active",
                plannerId: "PLN-108270",
                city: "Udaipur, Rajasthan",
                availabilityStatus: "Available",
                bio: "I believe every wedding has a unique story and it deserves to be told in the most beautiful way. With years of experience in crafting unforgettable celebrations, I ensure every detail is perfect and every moment is magical.",
                languages: ["English", "Hindi"],
                achievements: ["Best Luxury Destination Planner 2024", "Top 50 Wedding Designers globally"],
                categoriesHandled: ["Destination Weddings", "Royal Weddings", "Luxury Weddings"],
                profileImage: "https://addyevents.in/wp-content/uploads/2025/07/NRI-WEdding-Planner-.jpg",
                coverImage: "https://cdn0.weddingwire.com/article/9543/3_2/960/jpg/3459-ema-giangreco-weddings-what-does-a-wedding-planner-do.jpeg",
                portfolio: {
                    images: [
                        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
                        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600",
                        "https://images.unsplash.com/photo-1519225495810-7517c319b53b?q=80&w=600",
                        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600",
                        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600",
                        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600",
                        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600",
                        "https://images.unsplash.com/photo-1546032994-380cc0ed78b4?q=80&w=600",
                        "https://sp-ao.shortpixel.ai/client/to_auto,q_lossless,ret_img,w_1365,h_2048/https://www.avenuecalgary.com/wp-content/uploads/2024/01/WeddingPlanner2025-scaled.jpg"
                    ],
                    videos: [],
                    testimonials: [
                        { clientName: "Anjali & Rohan", reviewText: "Pankaj and his team made our dream wedding a reality. Every detail was beyond our expectations!", rating: 5 },
                        { clientName: "Neha & Karan", reviewText: "Professional, creative and extremely dedicated. Our destination wedding was perfectly planned.", rating: 5 },
                        { clientName: "Priya & Amit", reviewText: "The best decision we made was choosing Pankaj as our wedding planner. Highly recommended!", rating: 5 }
                    ]
                },
                events: [
                    { name: "Royal Extravaganza in Jagmandir", venue: "Jagmandir Palace, Udaipur", date: new Date("2025-11-20"), guestCount: 550, budget: 12000000, status: "Completed", role: "Lead Planner", rating: 5, gallery: ["https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"] },
                    { name: "Serene Lakeside Vows", venue: "The Leela Palace, Udaipur", date: new Date("2026-02-14"), guestCount: 250, budget: 6500000, status: "Completed", role: "Lead Planner", rating: 5, gallery: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600"] }
                ],
                reviews: [
                    { clientName: "Anjali & Rohan", rating: 5, text: "Pankaj and his team made our dream wedding a reality. Every detail was beyond our expectations!", images: ["https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600"], verified: true },
                    { clientName: "Neha & Karan", rating: 5, text: "Professional, creative and extremely dedicated. Our destination wedding was perfectly planned.", images: [], verified: true },
                    { clientName: "Priya & Amit", rating: 5, text: "The best decision we made was choosing Pankaj as our wedding planner. Highly recommended!", images: [], verified: true }
                ]
            },
            {
                name: "Sophia Ross",
                email: "sophia@example.com",
                phoneNo: "9812345671",
                companyName: "Sophia Ross Luxury Weddings",
                specialiazation: "Royal Palaces & Destination Weddings",
                assignedEvents: "148",
                exprience: "8 Years",
                ratings: 4.9,
                status: "active",
                plannerId: "PLN-108273",
                city: "Udaipur",
                availabilityStatus: "Available",
                bio: "Crafting luxury, high-fashion destination weddings across Udaipur, Italy, and French Riviera. Known for exquisite attention to detail and large scale production.",
                languages: ["English", "French", "Hindi"],
                achievements: ["Best Luxury Destination Planner 2024", "Top 50 Wedding Designers globally"],
                categoriesHandled: ["Royal Weddings", "Destination Weddings", "Luxury Weddings"],
                profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256",
                coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
                portfolio: {
                    images: [
                        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=600",
                        "https://images.unsplash.com/photo-1519225495810-7517c319b53b?q=80&w=600",
                        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600",
                        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600"
                    ],
                    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
                    testimonials: [
                        { clientName: "Emily & James", reviewText: "Sophia made our palace wedding a fairy tale. Flawless execution and premium vendor selection!", rating: 5 }
                    ]
                },
                events: [
                    { name: "Royal Extravaganza in Jagmandir", venue: "Jagmandir Palace, Udaipur", date: new Date("2025-11-20"), guestCount: 550, budget: 12000000, status: "Completed", role: "Lead Planner", rating: 5, gallery: ["https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600"] }
                ],
                reviews: [
                    { clientName: "Alisha Goel", rating: 5, text: "Unmatched professionalism. The rose-gold themed dining layout she made was stunning.", images: ["https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600"], verified: true }
                ]
            },
            {
                name: "Aria Vance",
                email: "aria@example.com",
                phoneNo: "9812345672",
                companyName: "Vance & Co. Luxury Events",
                specialiazation: "Beachside Luxury & Coastal Weddings",
                assignedEvents: "94",
                exprience: "6 Years",
                ratings: 4.8,
                status: "active",
                plannerId: "PLN-283917",
                city: "Goa",
                availabilityStatus: "Available",
                bio: "Creating magical beachfront events and elegant coastal weddings. Specialized in modern chic decorations and sunset dining productions in Goa, Maldives, and Bali.",
                languages: ["English", "Spanish"],
                achievements: ["Top Beach Wedding Designer 2025"],
                categoriesHandled: ["Beach Weddings", "Destination Weddings", "Garden Weddings"],
                profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256",
                coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
                portfolio: {
                    images: [
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
                        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600"
                    ],
                    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
                    testimonials: [
                        { clientName: "Chloe & Liam", reviewText: "Aria is a sunset wizard! The beach dome decor was literally out of this world.", rating: 5 }
                    ]
                },
                events: [
                    { name: "Sunset Beach Vows", venue: "W Hotel Beach Front, Goa", date: new Date("2026-01-05"), guestCount: 180, budget: 4800000, status: "Completed", role: "Lead Planner", rating: 5, gallery: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600"] }
                ],
                reviews: [
                    { clientName: "Reema Sen", rating: 5, text: "Unforgettable sunset arrangements! Very communicative and organized team.", images: ["https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600"], verified: true }
                ]
            }
        ];

        // Seed planners
        const createdPlanners = [];
        for (const data of plannersData) {
            console.log(`Seeding planner: ${data.name}`);
            const user = await User.create({
                name: data.name,
                email: data.email,
                phoneNo: data.phoneNo,
                password: defaultPassword,
                role: "planner"
            });

            const planner = await Planner.create({
                name: user._id,
                email: user._id,
                plannerRole: user._id,
                userId: user._id,
                companyName: data.companyName,
                specialiazation: data.specialiazation,
                assignedEvents: data.assignedEvents,
                exprience: data.exprience,
                ratings: data.ratings,
                status: data.status,
                plannerId: data.plannerId,
                city: data.city,
                availabilityStatus: data.availabilityStatus,
                bio: data.bio,
                languages: data.languages,
                achievements: data.achievements,
                categoriesHandled: data.categoriesHandled,
                profileImage: data.profileImage,
                coverImage: data.coverImage
            });

            createdPlanners.push(planner);

            // Create portfolio
            await Portfolio.create({
                plannerId: planner._id,
                images: data.portfolio.images,
                videos: data.portfolio.videos,
                testimonials: data.portfolio.testimonials
            });

            // Create events
            for (const ev of data.events) {
                await EventHistory.create({
                    ...ev,
                    plannerId: planner._id
                });
            }

            // Create reviews
            for (const rev of data.reviews) {
                await Review.create({
                    ...rev,
                    plannerId: planner._id,
                    clientId: clientProfile._id // Associate to our client
                });
            }
        }

        // 3. Create Vendors
        const vendorsData = [
            {
                name: "Chef Pankaj & Royal Caterers",
                email: "caterer@example.com",
                phoneNo: "9812345674",
                businessName: "Royal Catering Services",
                vendorType: "Catering",
                rating: "4.9",
                experience: "10 Years",
                location: "Udaipur",
                availabilityStatus: "Available",
                responseTime: "within 30 mins",
                completedEvents: 124,
                servicesOffered: ["Fine Dining", "Cocktail Bar", "Live Counters", "Fusion Buffets", "Dessert Parlor"],
                priceRange: "1,500 - 4,000 INR per plate",
                portfolio: [
                    "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600",
                    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600",
                    "https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600"
                ],
                vendorId: "VND-839182",
                vendorLogo: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=150",
                coverImage: "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200",
                contactDetails: {
                    phone: "9812345674",
                    email: "caterer@example.com",
                    address: "Plot 42, Sukhadia Circle, Udaipur"
                }
            },
            {
                name: "Floral Fantasy & Decorators",
                email: "florist@example.com",
                phoneNo: "9812345675",
                businessName: "Floral Fantasy",
                vendorType: "Florist",
                rating: "4.8",
                experience: "5 Years",
                location: "Goa",
                availabilityStatus: "Busy",
                responseTime: "within 1 hour",
                completedEvents: 85,
                servicesOffered: ["Floral Arches", "Mandap Decor", "Theme Lighting", "Varmala Design", "Table Decor"],
                priceRange: "200,000 - 1,500,000 INR",
                portfolio: [
                    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600",
                    "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
                    "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600"
                ],
                vendorId: "VND-928174",
                vendorLogo: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=150",
                coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200",
                contactDetails: {
                    phone: "9812345675",
                    email: "florist@example.com",
                    address: "Candolim Road, Near W Hotel, Goa"
                }
            },
            {
                name: "Vogue Frames Photography",
                email: "photography@example.com",
                phoneNo: "9812345676",
                businessName: "Vogue Frames Studio",
                vendorType: "Photography",
                rating: "5.0",
                experience: "8 Years",
                location: "Jaipur",
                availabilityStatus: "Booked",
                responseTime: "within 2 hours",
                completedEvents: 210,
                servicesOffered: ["Candid Photography", "Pre-wedding Shoots", "Cinematography", "Traditional Videos", "Albums"],
                priceRange: "150,000 - 500,000 INR",
                portfolio: [
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600",
                    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=600",
                    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600"
                ],
                vendorId: "VND-102938",
                vendorLogo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=150",
                coverImage: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200",
                contactDetails: {
                    phone: "9812345676",
                    email: "photography@example.com",
                    address: "MI Road, Near Raj Mandir Cinema, Jaipur"
                }
            }
        ];

        // Seed vendors
        for (const data of vendorsData) {
            console.log(`Seeding vendor: ${data.name}`);
            const user = await User.create({
                name: data.name,
                email: data.email,
                phoneNo: data.phoneNo,
                password: defaultPassword,
                role: "vendor"
            });

            await Vendor.create({
                name: user._id,
                email: user._id,
                VendorRole: user._id,
                userId: user._id,
                businessName: data.businessName,
                vendorType: data.vendorType,
                rating: data.rating,
                experience: data.experience,
                location: data.location,
                availabilityStatus: data.availabilityStatus,
                responseTime: data.responseTime,
                completedEvents: data.completedEvents,
                servicesOffered: data.servicesOffered,
                priceRange: data.priceRange,
                portfolio: data.portfolio,
                vendorId: data.vendorId,
                vendorLogo: data.vendorLogo,
                coverImage: data.coverImage,
                contactDetails: data.contactDetails,
                status: "active"
            });
        }

        console.log("Database seeded successfully with Clients, Planners, and Vendors!");
        process.exit(0);
    } catch (error) {
        console.error("Error during database seeding:", error);
        process.exit(1);
    }
};

seedData();
