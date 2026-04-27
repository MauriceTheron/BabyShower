using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabySteps.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRsvpEventType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Rsvps_UserId_EventId",
                table: "Rsvps");

            migrationBuilder.AddColumn<string>(
                name: "EventType",
                table: "Rsvps",
                type: "text",
                nullable: false,
                defaultValue: "BabyShower");

            migrationBuilder.CreateIndex(
                name: "IX_Rsvps_UserId_EventId_EventType",
                table: "Rsvps",
                columns: new[] { "UserId", "EventId", "EventType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Rsvps_UserId_EventId_EventType",
                table: "Rsvps");

            migrationBuilder.DropColumn(
                name: "EventType",
                table: "Rsvps");

            migrationBuilder.CreateIndex(
                name: "IX_Rsvps_UserId_EventId",
                table: "Rsvps",
                columns: new[] { "UserId", "EventId" },
                unique: true);
        }
    }
}
