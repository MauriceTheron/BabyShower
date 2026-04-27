using BabySteps.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BabySteps.API.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Store> Stores => Set<Store>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<Rsvp> Rsvps => Set<Rsvp>();
    public DbSet<ProductList> ProductLists => Set<ProductList>();
    public DbSet<ProductListItem> ProductListItems => Set<ProductListItem>();
    public DbSet<ProductListUsage> ProductListUsages => Set<ProductListUsage>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        builder.Entity<Reservation>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.UserId);

        builder.Entity<Event>()
            .HasOne(e => e.Host)
            .WithOne(u => u.HostedEvent)
            .HasForeignKey<Event>(e => e.HostId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Event>()
            .HasIndex(e => e.Slug)
            .IsUnique();

        builder.Entity<Event>()
            .HasIndex(e => e.HostId)
            .IsUnique();

        builder.Entity<Product>()
            .HasOne(p => p.Event)
            .WithMany(e => e.Products)
            .HasForeignKey(p => p.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Store>()
            .HasOne(s => s.Event)
            .WithMany(e => e.Stores)
            .HasForeignKey(s => s.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Category>()
            .HasOne(c => c.Event)
            .WithMany(e => e.Categories)
            .HasForeignKey(c => c.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Reservation>()
            .HasOne(r => r.Event)
            .WithMany(e => e.Reservations)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<Rsvp>()
            .HasOne(r => r.User)
            .WithMany(u => u.Rsvps)
            .HasForeignKey(r => r.UserId);

        builder.Entity<Rsvp>()
            .HasOne(r => r.Event)
            .WithMany(e => e.Rsvps)
            .HasForeignKey(r => r.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Rsvp>()
            .HasIndex(r => new { r.UserId, r.EventId })
            .IsUnique();

        builder.Entity<ProductListItem>()
            .Property(i => i.Price)
            .HasPrecision(18, 2);

        builder.Entity<ProductListItem>()
            .HasOne(i => i.ProductList)
            .WithMany(l => l.Items)
            .HasForeignKey(i => i.ProductListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ProductList>()
            .HasOne(l => l.Host)
            .WithMany()
            .HasForeignKey(l => l.HostId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ProductListUsage>()
            .HasOne(u => u.ProductList)
            .WithMany(l => l.Usages)
            .HasForeignKey(u => u.ProductListId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ProductListUsage>()
            .HasOne(u => u.Host)
            .WithMany()
            .HasForeignKey(u => u.HostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ProductListUsage>()
            .HasIndex(u => new { u.ProductListId, u.HostId })
            .IsUnique();
    }
}
