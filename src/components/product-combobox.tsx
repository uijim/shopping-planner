"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { createProduct } from "@/app/recipes/actions";
import type { Product } from "@/db/schema";

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  defaultUnit: z.enum(["g", "ml", "unit"]),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

interface ProductComboboxProps {
  products: Product[];
  value: string;
  onChange: (value: string) => void;
  onProductCreated?: (product: Product) => void;
}

export function ProductCombobox({
  products,
  value,
  onChange,
  onProductCreated,
}: ProductComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedProduct = products.find((p) => p.id === value);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const exactMatch = products.some(
    (p) => p.name.toLowerCase() === searchValue.toLowerCase()
  );

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      defaultUnit: "unit",
    },
  });

  const handleCreateClick = () => {
    form.reset({
      name: searchValue,
      defaultUnit: "unit",
    });
    setShowCreateForm(true);
  };

  const handleCreateSubmit = async (data: CreateProductFormValues) => {
    setIsCreating(true);
    try {
      const newProduct = await createProduct(data);
      onProductCreated?.(newProduct);
      onChange(newProduct.id);
      setShowCreateForm(false);
      setSearchValue("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    form.reset();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedProduct ? selectedProduct.name : "Select product"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {showCreateForm ? (
          <div className="p-3 space-y-3">
            <h4 className="text-sm font-medium">Create New Product</h4>
            <Form {...form}>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Product name" autoComplete="off" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Unit</FormLabel>
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
                          <SelectItem value="unit">Unit</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="ml">Milliliters (ml)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelCreate}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isCreating}
                    onClick={form.handleSubmit(handleCreateSubmit)}
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        ) : (
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search products..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {searchValue.trim() && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer"
                    onClick={handleCreateClick}
                  >
                    <Plus className="h-4 w-4" />
                    Create &quot;{searchValue}&quot;
                  </button>
                )}
                {!searchValue.trim() && "No products found."}
              </CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => {
                      onChange(product.id);
                      setSearchValue("");
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === product.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {product.name}
                  </CommandItem>
                ))}
                {searchValue.trim() && !exactMatch && filteredProducts.length > 0 && (
                  <CommandItem
                    value="__create__"
                    onSelect={handleCreateClick}
                    className="text-muted-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create &quot;{searchValue}&quot;
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
