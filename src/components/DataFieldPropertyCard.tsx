export type DataFieldProperty = {
  id: string;
  dataType: string;
  name: string;
  description: string;
  properties?: DataFieldProperty[];
  items?: DataFieldProperty;
};

type DataFieldPropertyCardProps = {
  property: DataFieldProperty;
  path: string[];
  onUpdate: (path: string[], updates: Partial<DataFieldProperty>) => void;
  onRemove: (parentPath: string[], id: string) => void;
  onAddProperty: (path: string[]) => void;
  onSetItems: (path: string[], items: DataFieldProperty | undefined) => void;
  validationAttempted?: boolean;
  isArrayItem?: boolean;
};

// Recursive component for rendering data field property cards
export const DataFieldPropertyCard = ({
  property,
  path,
  onUpdate,
  onRemove,
  onAddProperty,
  onSetItems,
  validationAttempted = false,
  isArrayItem = false,
}: DataFieldPropertyCardProps) => {
  const currentPath = [...path, property.id];

  return (
    <div className="border border-border rounded-xl p-5 space-y-5 bg-background">
      {/* Data type and Identifier */}
      <div className={isArrayItem ? "" : "flex gap-4"}>
        <div className={isArrayItem ? "" : "w-40"}>
          <label className="block text-sm font-medium mb-2">Data type</label>
          <div className="relative">
            <select
              value={property.dataType}
              onChange={(e) => {
                const newType = e.target.value;
                onUpdate(isArrayItem ? path : currentPath, {
                  dataType: newType,
                });
              }}
              className="w-full h-10 pl-4 pr-10 rounded-md text-base border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer appearance-none"
            >
              <option value="boolean">Boolean</option>
              <option value="integer">Integer</option>
              <option value="number">Number</option>
              <option value="string">String</option>
              <option value="object">Object</option>
              <option value="array">Array</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </div>
        {!isArrayItem && (
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={property.name}
              onChange={(e) => onUpdate(currentPath, { name: e.target.value })}
              className={`w-full h-10 px-4 rounded-md text-base border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                validationAttempted && !property.name.trim()
                  ? "border-red-500"
                  : "border-border"
              }`}
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={property.description}
          onChange={(e) =>
            onUpdate(isArrayItem ? path : currentPath, {
              description: e.target.value,
            })
          }
          rows={3}
          className={`w-full px-4 py-3 rounded-md text-base border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none ${
            validationAttempted && !property.description.trim()
              ? "border-red-500"
              : "border-border"
          }`}
        />
      </div>

      {/* Properties section for object type */}
      {property.dataType === "object" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Properties <span className="text-red-500">*</span>
          </label>
          <div className="border border-border rounded-xl bg-[#1b1b1b] p-4 space-y-4">
            {property.properties &&
              property.properties.length > 0 &&
              property.properties.map((prop) => (
                <DataFieldPropertyCard
                  key={prop.id}
                  property={prop}
                  path={isArrayItem ? path : currentPath}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onAddProperty={onAddProperty}
                  onSetItems={onSetItems}
                  validationAttempted={validationAttempted}
                />
              ))}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onAddProperty(isArrayItem ? path : currentPath)}
                className={`h-10 px-6 rounded-md text-sm font-medium border bg-background hover:bg-muted/50 transition-colors cursor-pointer ${
                  validationAttempted &&
                  (!property.properties || property.properties.length === 0)
                    ? "border-red-500"
                    : "border-border"
                }`}
              >
                Add property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item section for array type */}
      {property.dataType === "array" && (
        <div>
          <label className="block text-sm font-medium mb-2">Item</label>
          <div className="border border-border rounded-xl bg-[#1b1b1b] p-4 space-y-4">
            <DataFieldPropertyCard
              property={
                property.items || {
                  id: crypto.randomUUID(),
                  dataType: "string",
                  name: "",
                  description: "",
                }
              }
              path={
                isArrayItem
                  ? [...path, "__items__"]
                  : [...currentPath, "__items__"]
              }
              onUpdate={onUpdate}
              onRemove={onRemove}
              onAddProperty={onAddProperty}
              onSetItems={onSetItems}
              validationAttempted={validationAttempted}
              isArrayItem={true}
            />
          </div>
        </div>
      )}

      {/* Delete button - not shown for array items */}
      {!isArrayItem && (
        <div className="flex justify-end">
          <button
            onClick={() => onRemove(path, property.id)}
            className="h-9 px-4 rounded-md text-sm font-medium text-red-500 bg-red-500/10 hover:text-red-600 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
