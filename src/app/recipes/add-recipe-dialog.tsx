"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { createRecipe } from "./actions";
import { toBaseUnit } from "@/lib/units";
import type { Product } from "@/db/schema";
import { ProductCombobox } from "@/components/product-combobox";

const ingredientSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Select a unit"),
});

const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  servings: z.number().int().positive(),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "At least one ingredient is required"),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

const UNIT_OPTIONS = [
  { value: "unit", label: "unit" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "oz", label: "oz" },
  { value: "lb", label: "lb" },
  { value: "ml", label: "ml" },
  { value: "l", label: "l" },
  { value: "tsp", label: "tsp" },
  { value: "tbsp", label: "tbsp" },
  { value: "cup", label: "cup" },
];

interface AddRecipeDialogProps {
  products: Product[];
}

export function AddRecipeDialog({ products: initialProducts }: AddRecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>(initialProducts);

  const handleProductCreated = (newProduct: Product) => {
    setLocalProducts((prev) => [...prev, newProduct].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      description: "",
      instructions: "",
      servings: 4,
      ingredients: [{ productId: "", quantity: 1, unit: "unit" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  async function onSubmit(data: RecipeFormValues) {
    setIsSubmitting(true);
    try {
      const ingredientsWithBase = data.ingredients.map((ing) => {
        const { baseQuantity, baseUnit } = toBaseUnit(ing.quantity, ing.unit);
        return {
          productId: ing.productId,
          quantity: ing.quantity,
          unit: ing.unit,
          baseQuantity,
          baseUnit,
        };
      });

      await createRecipe({
        name: data.name,
        description: data.description,
        instructions: data.instructions,
        servings: data.servings,
        ingredients: ingredientsWithBase,
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create recipe:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" />
          Add Recipe
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[90vh] flex-col sm:max-w-[600px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Recipe</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col space-y-6 overflow-y-auto">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spaghetti Bolognese" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Ingredients</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ productId: "", quantity: 1, unit: "unit" })
                  }
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Ingredient
                </Button>
              </div>

              {form.formState.errors.ingredients?.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.ingredients.root.message}
                </p>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <ProductCombobox
                            products={localProducts}
                            value={field.value}
                            onChange={field.onChange}
                            onProductCreated={handleProductCreated}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-20">
                        <FormControl>
                          <Input
                            type="number"
                            min={0.01}
                            step="any"
                            placeholder="Qty"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.unit`}
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UNIT_OPTIONS.map((unit) => (
                              <SelectItem key={unit.value} value={unit.value}>
                                {unit.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add cooking instructions..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Recipe"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
