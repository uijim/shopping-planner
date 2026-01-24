"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { updateRecipe, deleteRecipe } from "./actions";
import { toBaseUnit } from "@/lib/units";
import type { Product } from "@/db/schema";

const ingredientSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Select a unit"),
});

const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
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

interface RecipeWithIngredients {
  id: string;
  name: string;
  description: string | null;
  servings: number;
  recipeProducts: {
    productId: string;
    quantity: number;
    unit: string;
  }[];
}

interface EditRecipeDialogProps {
  recipe: RecipeWithIngredients;
  products: Product[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRecipeDialog({
  recipe,
  products,
  open,
  onOpenChange,
}: EditRecipeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: recipe.name,
      description: recipe.description || "",
      servings: recipe.servings,
      ingredients: recipe.recipeProducts.map((rp) => ({
        productId: rp.productId,
        quantity: rp.quantity,
        unit: rp.unit,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  // Reset form when recipe changes
  useEffect(() => {
    form.reset({
      name: recipe.name,
      description: recipe.description || "",
      servings: recipe.servings,
      ingredients: recipe.recipeProducts.map((rp) => ({
        productId: rp.productId,
        quantity: rp.quantity,
        unit: rp.unit,
      })),
    });
  }, [recipe, form]);

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

      await updateRecipe({
        id: recipe.id,
        name: data.name,
        description: data.description,
        servings: data.servings,
        ingredients: ingredientsWithBase,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update recipe:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRecipe(recipe.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Recipe</DialogTitle>
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A brief description of the recipe"
                      {...field}
                    />
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="order-last sm:order-first"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
