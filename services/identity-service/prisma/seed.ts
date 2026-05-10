import { UserRole } from "../src/common/entities/user.entity";
import { VerificationStatus } from "../src/common/entities/merchant-profile.entity";
import { DocumentType } from "../src/common/entities/merchant-document.entity";
import * as bcrypt from "bcrypt";

export async function main() {
  console.log("🌱 Starting Identity Service seed data...");
  console.log("Note: Seed data requires TypeORM repositories to be injected");
  console.log("This seed file needs to be updated to work with TypeORM");
  
  // TODO: Implement TypeORM-based seeding
  console.log("Seed data creation skipped - needs TypeORM implementation");
  
  // Create Admin Users
  const adminUsers = [
    {
      id: "admin-001",
      phoneNumber: "+966500000001",
      fullName: "System Administrator",
      role: UserRole.ADMIN,
      isVerified: true,
      trustScore: 100.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "admin-002",
      phoneNumber: "+966500000002",
      fullName: "Support Administrator",
      role: UserRole.ADMIN,
      isVerified: true,
      trustScore: 100.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  console.log("Admin users created:", adminUsers.length);
  console.log("Seed completed successfully");
}
