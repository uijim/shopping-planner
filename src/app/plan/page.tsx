import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEALS = ["Breakfast", "Lunch", "Dinner"] as const;

export default function PlanPage() {
  return (
    <main className="flex min-h-screen flex-col p-8">
      <h1 className="mb-6 text-2xl font-bold">Meal Planner</h1>
      <p className="mb-8 text-muted-foreground">
        Plan your meals for the week, then generate a shopping list.
      </p>

      <div className="grid gap-4">
        {/* Header row with meal types */}
        <div className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4">
          <div></div>
          {MEALS.map((meal) => (
            <div
              key={meal}
              className="text-center text-sm font-medium text-muted-foreground"
            >
              {meal}
            </div>
          ))}
        </div>

        {/* Day rows */}
        {DAYS.map((day) => (
          <div key={day} className="grid grid-cols-[120px_1fr_1fr_1fr] gap-4">
            <div className="flex items-center font-medium">{day}</div>
            {MEALS.map((meal) => (
              <Card
                key={`${day}-${meal}`}
                className="cursor-pointer transition-colors hover:bg-accent"
              >
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-normal text-muted-foreground">
                    + Add recipe
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="h-8"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
