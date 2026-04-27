using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BabySteps.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProductListEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HostId",
                table: "ProductLists",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsAuto",
                table: "ProductLists",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdated",
                table: "ProductLists",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductListUsages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductListId = table.Column<int>(type: "integer", nullable: false),
                    HostId = table.Column<string>(type: "text", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductListUsages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductListUsages_AspNetUsers_HostId",
                        column: x => x.HostId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductListUsages_ProductLists_ProductListId",
                        column: x => x.ProductListId,
                        principalTable: "ProductLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductLists_HostId",
                table: "ProductLists",
                column: "HostId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductListUsages_HostId",
                table: "ProductListUsages",
                column: "HostId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductListUsages_ProductListId_HostId",
                table: "ProductListUsages",
                columns: new[] { "ProductListId", "HostId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductLists_AspNetUsers_HostId",
                table: "ProductLists",
                column: "HostId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProductLists_AspNetUsers_HostId",
                table: "ProductLists");

            migrationBuilder.DropTable(
                name: "ProductListUsages");

            migrationBuilder.DropIndex(
                name: "IX_ProductLists_HostId",
                table: "ProductLists");

            migrationBuilder.DropColumn(
                name: "HostId",
                table: "ProductLists");

            migrationBuilder.DropColumn(
                name: "IsAuto",
                table: "ProductLists");

            migrationBuilder.DropColumn(
                name: "LastUpdated",
                table: "ProductLists");
        }
    }
}
