# Generated by Django 1.11.29 on 2020-11-13 20:33

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import sentry.db.models.fields.array
import sentry.db.models.fields.bounded
import sentry.db.models.fields.foreignkey


class Migration(migrations.Migration):
    # This flag is used to mark that a migration shouldn't be automatically run in
    # production. We set this to True for operations that we think are risky and want
    # someone from ops to run manually and monitor.
    # General advice is that if in doubt, mark your migration as `is_dangerous`.
    # Some things you should always mark as dangerous:
    # - Large data migrations. Typically we want these to be run manually by ops so that
    #   they can be monitored. Since data migrations will now hold a transaction open
    #   this is even more important.
    # - Adding columns to highly active tables, even ones that are NULL.
    is_dangerous = False

    # This flag is used to decide whether to run this migration in a transaction or not.
    # By default we prefer to run in a transaction, but for migrations where you want
    # to `CREATE INDEX CONCURRENTLY` this needs to be set to False. Typically you'll
    # want to create an index concurrently when adding one to an existing table.
    atomic = True

    dependencies = [
        ("sentry", "0127_backfill_platformexternalissue_project_id"),
    ]

    operations = [
        migrations.CreateModel(
            name="DashboardWidget",
            fields=[
                (
                    "id",
                    sentry.db.models.fields.bounded.BoundedBigAutoField(
                        primary_key=True, serialize=False
                    ),
                ),
                ("order", sentry.db.models.fields.bounded.BoundedPositiveIntegerField()),
                ("title", models.CharField(max_length=255)),
                (
                    "display_type",
                    sentry.db.models.fields.bounded.BoundedPositiveIntegerField(
                        choices=[
                            (0, "line"),
                            (1, "area"),
                            (2, "stacked_area"),
                            (3, "bar"),
                            (4, "table"),
                        ]
                    ),
                ),
                ("date_added", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "dashboard",
                    sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="sentry.Dashboard"
                    ),
                ),
            ],
            options={
                "db_table": "sentry_dashboardwidget",
            },
        ),
        migrations.CreateModel(
            name="DashboardWidgetQuery",
            fields=[
                (
                    "id",
                    sentry.db.models.fields.bounded.BoundedBigAutoField(
                        primary_key=True, serialize=False
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("fields", sentry.db.models.fields.array.ArrayField(null=True)),
                ("conditions", models.TextField()),
                ("interval", models.CharField(max_length=10)),
                ("order", sentry.db.models.fields.bounded.BoundedPositiveIntegerField()),
                ("date_added", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "widget",
                    sentry.db.models.fields.foreignkey.FlexibleForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="sentry.DashboardWidget"
                    ),
                ),
            ],
            options={
                "db_table": "sentry_dashboardwidgetquery",
            },
        ),
        migrations.AlterUniqueTogether(
            name="dashboardwidgetquery",
            unique_together=set([("widget", "order"), ("widget", "name")]),
        ),
        migrations.AlterUniqueTogether(
            name="dashboardwidget",
            unique_together=set([("dashboard", "title"), ("dashboard", "order")]),
        ),
    ]
