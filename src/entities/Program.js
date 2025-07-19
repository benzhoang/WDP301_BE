/**
 * Program Entity for TypeORM
 * Represents the Programs table in the database
 */
const { EntitySchema } = require('typeorm');

const Program = new EntitySchema({
    name: "Program",
    tableName: "Programs",
    columns: {
        program_id: {
            type: "int",
            primary: true,
            generated: true
        },
        img_link: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        title: {
            type: "nvarchar",
            length: 255,
            nullable: false
        },
        description: {
            type: "nvarchar",
            length: "MAX",
            nullable: true
        },
        create_by: {
            type: "int",
            nullable: false
        },
        status: {
            type: "nvarchar",
            length: 50,
            nullable: false
        },
        age_group: {
            type: "nvarchar",
            length: 50,
            nullable: true
        },
        create_at: {
            type: "datetime",
            nullable: false,
            default: () => "GETDATE()"
        },
        category_id: {
            type: "int",
            nullable: false
        }
    },
    relations: {
        creator: {
            type: "many-to-one",
            target: "User",
            joinColumn: {
                name: "create_by",
                referencedColumnName: "user_id"
            }
        },
        category: {
            type: "many-to-one",
            target: "Category",
            joinColumn: {
                name: "category_id",
                referencedColumnName: "category_id"
            }
        },
        enrollments: {
            type: "one-to-many",
            target: "Enroll",
            inverseSide: "program"
        },
        contents: {
            type: "one-to-many",
            target: "Content",
            inverseSide: "program"
        },
        surveys: {
            type: "one-to-many",
            target: "Survey",
            inverseSide: "program"
        }
    }
});

module.exports = Program;
