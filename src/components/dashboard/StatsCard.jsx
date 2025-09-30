import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";



export function StatsCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className,
  to 
}) {
  const Wrapper = to ? Link : "div";
  return (
    
    <Wrapper to={to} className="block">
    <Card className={cn(
      "relative overflow-hidden border-muted-foreground/20 bg-gradient-surface backdrop-blur-sm hover:shadow-elevated transition-smooth",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-8 h-8 text-primary flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <div className={cn(
            "text-xs mt-1 flex items-center gap-1",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            <span>{trend.isPositive ? "↗" : "↘"}</span>
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </CardContent>
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-primary opacity-5 rounded-full -mr-8 -mt-8" />
    </Card>
    </Wrapper>
  );
}