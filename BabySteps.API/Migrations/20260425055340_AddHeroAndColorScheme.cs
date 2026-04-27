using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabySteps.API.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroAndColorScheme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccentColor",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HeroImageUrl",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryColor",
                table: "Events",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryColor",
                table: "Events",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccentColor",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "HeroImageUrl",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "PrimaryColor",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "SecondaryColor",
                table: "Events");
        }
    }
}
