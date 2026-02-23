from django.db import models


class Ticket(models.Model):
    """Support ticket model with database-level constraints and indexes."""

    class Category(models.TextChoices):
        BILLING = 'billing', 'Billing'
        TECHNICAL = 'technical', 'Technical'
        ACCOUNT = 'account', 'Account'
        GENERAL = 'general', 'General'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.GENERAL,
    )
    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category'], name='idx_ticket_category'),
            models.Index(fields=['priority'], name='idx_ticket_priority'),
            models.Index(fields=['status'], name='idx_ticket_status'),
            models.Index(fields=['-created_at'], name='idx_ticket_created'),
        ]

    def __str__(self):
        return f"[{self.priority.upper()}] {self.title}"
