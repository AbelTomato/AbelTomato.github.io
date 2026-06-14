import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";

interface ArchiveTagFilterProps {
  postCount: number;
  selectedTag: string | null;
  tagCountsMap: Record<string, number>;
  onSelectTag: (tag: string | null) => void;
}

export function ArchiveTagFilter({
  postCount,
  selectedTag,
  tagCountsMap,
  onSelectTag,
}: ArchiveTagFilterProps) {
  return (
    <Card className="rounded-xl shadow-xs transition-colors">
      <CardContent className="p-5 space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          标签检索{" "}
          {selectedTag && (
            <span className="text-primary font-normal">
              (当前：{selectedTag})
            </span>
          )}
        </h3>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedTag === null ? "default" : "secondary"}
            onClick={() => onSelectTag(null)}
            className="text-xs h-7 px-3 rounded-md"
          >
            全部文章 ({postCount})
          </Button>
          {Object.entries(tagCountsMap).map(([tag, count]) => {
            const isSelected = tag === selectedTag;

            return (
              <Button
                key={tag}
                size="sm"
                variant={isSelected ? "default" : "secondary"}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className="text-xs h-7 px-3 rounded-md font-normal"
              >
                #{tag} ({count})
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
