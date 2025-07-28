/**
 * Consultant Controller using TypeORM
 * CRUD operations for Consultant table
 */
const AppDataSource = require("../src/data-source");
const Consultant = require("../src/entities/Consultant");
const User = require("../src/entities/User");
const Profile = require("../src/entities/Profile");
const BookingSession = require("../src/entities/BookingSession");
const ConsultantSlot = require("../src/entities/ConsultantSlot");
const Slot = require("../src/entities/Slot");

class ConsultantController {
  /**
   * Get all consultants
   */
  static async getAllConsultants(req, res) {
    try {
      // Get detailed consultant information with user data
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultants = await consultantRepository.find({
        relations: {
          user: true,
        },
      });

      // Get profile data for all consultants
      const profileRepository = AppDataSource.getRepository(Profile);
      const profiles = await profileRepository.find();

      // Get consultant slots with slot details
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);
      const consultantSlots = await consultantSlotRepository.find({
        relations: {
          slot: true,
        },
      });

      // Create maps for quick lookup
      const profileMap = new Map();
      profiles.forEach((profile) => profileMap.set(profile.user_id, profile));

      const consultantSlotsMap = new Map();
      consultantSlots.forEach((consultantSlot) => {
        if (!consultantSlotsMap.has(consultantSlot.consultant_id)) {
          consultantSlotsMap.set(consultantSlot.consultant_id, []);
        }
        consultantSlotsMap.get(consultantSlot.consultant_id).push({
          day_of_week: consultantSlot.day_of_week,
          slot_id: consultantSlot.slot_id,
          start_time: consultantSlot.slot?.start_time,
          end_time: consultantSlot.slot?.end_time,
        });
      });

      // Transform the data to include ALL fields from Users, Consultant, Profile, and Slot tables
      const consultantDetails = consultants.map((consultant) => {
        const profile = profileMap.get(consultant.user_id);
        const slots = consultantSlotsMap.get(consultant.id_consultant) || [];

        return {
          // Consultant table fields
          id_consultant: consultant.id_consultant,
          google_meet_link: consultant.google_meet_link,
          certification: consultant.certification,
          speciality: consultant.speciality,

          // Users table fields (excluding password for security)
          user_id: consultant.user_id,
          date_create: consultant.user?.date_create,
          role: consultant.user?.role,
          status: consultant.user?.status,
          email: consultant.user?.email,
          img_link: consultant.user?.img_link,

          // Profile table fields
          name: profile?.name,
          bio_json: profile?.bio_json,
          date_of_birth: profile?.date_of_birth,
          job: profile?.job,

          // Slot information
          available_slots: slots,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          totalConsultants: consultants.length,
          consultants: consultantDetails,
        },
        message: "Consultants retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultants:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultants",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant by ID
   */
  static async getConsultantById(req, res) {
    try {
      const { consultantId } = req.params;
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
        relations: {
          user: true,
        },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Get profile information for the consultant
      const profileRepository = AppDataSource.getRepository(Profile);
      const profile = await profileRepository.findOne({
        where: { user_id: consultant.user_id },
      });

      // Get consultant slots with slot details
      const consultantSlotRepository = AppDataSource.getRepository(ConsultantSlot);
      const consultantSlots = await consultantSlotRepository.find({
        where: { consultant_id: parseInt(consultantId) },
        relations: {
          slot: true,
        },
      });

      // Transform slots data
      const slots = consultantSlots.map((consultantSlot) => ({
        day_of_week: consultantSlot.day_of_week,
        slot_id: consultantSlot.slot_id,
        start_time: consultantSlot.slot?.start_time,
        end_time: consultantSlot.slot?.end_time,
      }));

      // Format consultant information with ALL fields from Users, Consultant, Profile, and Slot tables
      const consultantDetail = {
        // Consultant table fields
        id_consultant: consultant.id_consultant,
        google_meet_link: consultant.google_meet_link,
        certification: consultant.certification,
        speciality: consultant.speciality,

        // Users table fields (excluding password for security)
        user_id: consultant.user_id,
        date_create: consultant.user?.date_create,
        role: consultant.user?.role,
        status: consultant.user?.status,
        email: consultant.user?.email,
        img_link: consultant.user?.img_link,

        // Profile table fields
        name: profile?.name,
        bio_json: profile?.bio_json,
        date_of_birth: profile?.date_of_birth,
        job: profile?.job,

        // Slot information
        available_slots: slots,
      };

      res.status(200).json({
        success: true,
        data: consultantDetail,
        message: "Consultant retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant with user information and profile
   */
  static async getConsultantWithUserInfo(req, res) {
    try {
      const { id } = req.params;
      const consultantRepository = AppDataSource.getRepository(Consultant);

      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(id) },
        relations: {
          user: true,
        },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Get profile information if available
      const profileRepository = AppDataSource.getRepository(Profile);
      const profile = await profileRepository.findOne({
        where: { user_id: consultant.user_id },
      });

      // Format response with ALL fields from Users, Consultant, and Profile tables
      const consultantData = {
        // Consultant table fields
        id_consultant: consultant.id_consultant,
        google_meet_link: consultant.google_meet_link,
        certification: consultant.certification,
        speciality: consultant.speciality,

        // Users table fields (excluding password for security)
        user_id: consultant.user?.user_id,
        date_create: consultant.user?.date_create,
        role: consultant.user?.role,
        status: consultant.user?.status,
        email: consultant.user?.email,
        img_link: consultant.user?.img_link,

        // Profile table fields
        name: profile?.name,
        bio_json: profile?.bio_json,
        date_of_birth: profile?.date_of_birth,
        job: profile?.job,
      };

      res.status(200).json({
        success: true,
        data: consultantData,
        message: "Consultant with user info retrieved successfully",
      });
    } catch (error) {
      console.error("Error getting consultant with user info:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant with user info",
        error: error.message,
      });
    }
  }

  /**
   * Create new consultant with complete data from Users, Consultant, and Profile tables
   */
  static async createConsultant(req, res) {
    try {
      const {
        // User table fields
        role,
        password,
        status,
        email,
        // Consultant table fields
        google_meet_link,
        certification,
        speciality,
        // Profile table fields
        name,
        bio_json,
        date_of_birth,
        job,
      } = req.body;

      // Validate required fields
      if (!email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and role are required",
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const consultantRepository = AppDataSource.getRepository(Consultant);
      const profileRepository = AppDataSource.getRepository(Profile);

      // Check if user already exists with this email
      const existingUser = await userRepository.findOne({
        where: { email: email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "A user with this email already exists",
        });
      }

      // Start transaction to ensure data integrity
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Create new user
        const newUser = queryRunner.manager.create(User, {
          role: role,
          password: password, // Note: In production, this should be hashed
          status: status || "active",
          email: email,
        });

        const savedUser = await queryRunner.manager.save(User, newUser);

        // Create consultant profile
        const newConsultant = queryRunner.manager.create(Consultant, {
          user_id: savedUser.user_id,
          google_meet_link: google_meet_link || null,
          certification: certification || null,
          speciality: speciality || null,
        });

        const savedConsultant = await queryRunner.manager.save(Consultant, newConsultant);

        // Create profile if profile data is provided
        let savedProfile = null;
        if (name || bio_json || date_of_birth || job) {
          const newProfile = queryRunner.manager.create(Profile, {
            user_id: savedUser.user_id,
            name: name || null,
            bio_json: JSON.stringify(bio_json) || null,
            date_of_birth: date_of_birth || null,
            job: job || null,
          });

          savedProfile = await queryRunner.manager.save(Profile, newProfile);
        }

        await queryRunner.commitTransaction();

        // Return complete consultant data
        const completeConsultantData = {
          // Consultant table fields
          id_consultant: savedConsultant.id_consultant,
          google_meet_link: savedConsultant.google_meet_link,
          certification: savedConsultant.certification,
          speciality: savedConsultant.speciality,

          // Users table fields (excluding password for security)
          user_id: savedUser.user_id,
          date_create: savedUser.date_create,
          role: savedUser.role,
          status: savedUser.status,
          email: savedUser.email,
          img_link: savedUser.img_link,

          // Profile table fields
          name: savedProfile?.name,
          bio_json: savedProfile?.bio_json,
          date_of_birth: savedProfile?.date_of_birth,
          job: savedProfile?.job,
        };

        res.status(201).json({
          success: true,
          data: completeConsultantData,
          message: "Consultant created successfully with complete profile",
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create consultant",
        error: error.message,
      });
    }
  }

  /**
   * Update consultant with complete data from Users, Consultant, and Profile tables
   */
  static async updateConsultant(req, res) {
    try {
      const { consultantId } = req.params;
      const {
        // User table fields
        role,
        status,
        email,
        // Consultant table fields
        google_meet_link,
        certification,
        speciality,
        // Profile table fields
        name,
        bio_json,
        date_of_birth,
        job,
      } = req.body;

      const consultantRepository = AppDataSource.getRepository(Consultant);
      const userRepository = AppDataSource.getRepository(User);
      const profileRepository = AppDataSource.getRepository(Profile);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
        relations: { user: true },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Start transaction to ensure data integrity
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Update consultant fields
        if (google_meet_link !== undefined) consultant.google_meet_link = google_meet_link;
        if (certification !== undefined)
          consultant.certification = certification;
        if (speciality !== undefined) consultant.speciality = speciality;

        const updatedConsultant = await queryRunner.manager.save(Consultant, consultant);

        // Update user fields
        const user = await queryRunner.manager.findOne(User, {
          where: { user_id: consultant.user_id },
        });

        if (user) {
          if (role !== undefined) user.role = role;
          if (status !== undefined) user.status = status;
          if (email !== undefined) user.email = email;

          await queryRunner.manager.save(User, user);
        }

        // Update or create profile
        let profile = await queryRunner.manager.findOne(Profile, {
          where: { user_id: consultant.user_id },
        });

        if (!profile && (name || bio_json || date_of_birth || job)) {
          // Create new profile if it doesn't exist and we have profile data
          profile = queryRunner.manager.create(Profile, {
            user_id: consultant.user_id,
            name: name || null,
            bio_json: JSON.stringify(bio_json) || null,
            date_of_birth: date_of_birth || null,
            job: job || null,
          });
        } else if (profile) {
          // Update existing profile
          if (name !== undefined) profile.name = name;
          if (bio_json !== undefined) profile.bio_json = JSON.stringify(bio_json);
          if (date_of_birth !== undefined)
            profile.date_of_birth = date_of_birth;
          if (job !== undefined) profile.job = job;
        }

        if (profile) {
          await queryRunner.manager.save(Profile, profile);
        }

        await queryRunner.commitTransaction();

        // Get updated user data
        const updatedUser = await userRepository.findOne({
          where: { user_id: consultant.user_id },
        });

        // Return complete updated data
        const completeUpdatedData = {
          // Consultant table fields
          id_consultant: updatedConsultant.id_consultant,
          google_meet_link: updatedConsultant.google_meet_link,
          certification: updatedConsultant.certification,
          speciality: updatedConsultant.speciality,

          // Users table fields (excluding password for security)
          user_id: updatedUser?.user_id,
          date_create: updatedUser?.date_create,
          role: updatedUser?.role,
          status: updatedUser?.status,
          email: updatedUser?.email,
          img_link: updatedUser?.img_link,

          // Profile table fields
          name: profile?.name,
          bio_json: profile?.bio_json,
          date_of_birth: profile?.date_of_birth,
          job: profile?.job,
        };

        res.status(200).json({
          success: true,
          data: completeUpdatedData,
          message: "Consultant updated successfully with complete profile",
        });
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error("Error updating consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update consultant",
        error: error.message,
      });
    }
  }

  /**
   * Search consultants by name (using Profile table)
   */
  static async searchConsultantsByName(req, res) {
    try {
      const { consultantName } = req.params;

      if (!consultantName) {
        return res.status(400).json({
          success: false,
          message: "Search name is required",
        });
      }

      const consultantRepository = AppDataSource.getRepository(Consultant);

      // Search consultants using profile name
      const consultants = await consultantRepository
        .createQueryBuilder("consultant")
        .innerJoinAndSelect("consultant.user", "user")
        .leftJoinAndSelect("user.profile", "profile") // ✅ Select luôn profile
        .where("LOWER(profile.name) LIKE LOWER(:name)", {
          name: `%${consultantName.trim().toLowerCase()}%`,
        })
        .getMany();

      // Không cần truy vấn profile lại nữa

      // Trả dữ liệu đã gộp
      const formattedConsultants = consultants.map((consultant) => {
        const profile = consultant.user.profile;

        return {
          // Consultant table fields
          id_consultant: consultant.id_consultant,
          google_meet_link: consultant.google_meet_link,
          certification: consultant.certification,
          speciality: consultant.speciality,

          // Users table fields
          user_id: consultant.user_id,
          date_create: consultant.user?.date_create,
          role: consultant.user?.role,
          status: consultant.user?.status,
          email: consultant.user?.email,
          img_link: consultant.user?.img_link,

          // Profile table fields
          name: profile?.name,
          bio_json: profile?.bio_json,
          date_of_birth: profile?.date_of_birth,
          job: profile?.job,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          totalConsultants: formattedConsultants.length,
          consultants: formattedConsultants,
        },
        message: `Found ${formattedConsultants.length} consultants matching "${consultantName}"`,
      });
    } catch (error) {
      console.error("Error searching consultants by name:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search consultants by name",
        error: error.message,
      });
    }
  }

  /**
   * Get consultant ID by user ID (from token)
   */
  static async getConsultantIdByUserId(req, res) {
    try {
      // Get user_id from the authenticated user token
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      const consultantRepository = AppDataSource.getRepository(Consultant);

      // Find consultant by user_id
      const consultant = await consultantRepository.findOne({
        where: { user_id: parseInt(userId) },
        select: ['id_consultant', 'user_id'] // Only select necessary fields
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found for this user",
          data: null
        });
      }

      res.status(200).json({
        success: true,
        data: {
          consultant_id: consultant.id_consultant,
          user_id: consultant.user_id
        },
        message: "Consultant ID retrieved successfully"
      });

    } catch (error) {
      console.error("Error getting consultant ID by user ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant ID",
        error: error.message,
      });
    }
  }

  static async getConsultantIdByUserEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required"
        });
      }

      console.log("Looking for consultant with email:", email);

      // Find consultant by email using proper SQL query
      const result = await AppDataSource.query(
        'SELECT c.id_consultant, c.user_id FROM Consultant c JOIN Users u ON c.user_id = u.user_id WHERE u.email = @0 ',
        [email]
      );

      console.log("Query result:", result);

      // Check if result array is empty or no consultant found
      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found for this user",
          data: null
        });
      }

      // Get the first result (should be only one)
      const consultant = result[0];

      res.status(200).json({
        success: true,
        data: {
          consultant_id: consultant.id_consultant,
          user_id: consultant.user_id
        },
        message: "Consultant ID retrieved successfully"
      });

    } catch (error) {
      console.error("Error getting consultant ID by email:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve consultant ID",
        error: error.message,
      });
    }
  }
  /**
   * Delete consultant
   */
  static async deleteConsultant(req, res) {
    try {
      const { consultantId } = req.params;

      const consultantRepository = AppDataSource.getRepository(Consultant);

      // Check if consultant exists
      const consultant = await consultantRepository.findOne({
        where: { id_consultant: parseInt(consultantId) },
      });

      if (!consultant) {
        return res.status(404).json({
          success: false,
          message: "Consultant not found",
        });
      }

      // Delete the consultant
      await consultantRepository.delete({
        id_consultant: parseInt(consultantId),
      });

      res.status(200).json({
        success: true,
        message: "Consultant deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting consultant:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete consultant",
        error: error.message,
      });
    }
  }
}

module.exports = ConsultantController;
