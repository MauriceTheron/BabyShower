using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BabySteps.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProductNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Products",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Products");
        }
    }
}
