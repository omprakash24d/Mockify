/**
 * Security Events List Component
 */

import { Activity, Eye } from "lucide-react";
import React from "react";
import { Card } from "../../ui/Card";
import type { SecurityEvent } from "../types";
import { EventItem } from "./EventItem";

interface EventsListProps {
  events: SecurityEvent[];
}

export const EventsList: React.FC<EventsListProps> = ({ events }) => {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Recent Security Events
        </h2>
      </div>

      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security events recorded yet</p>
            <p className="text-sm mt-1">
              Events will appear here as they occur
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.slice(0, 20).map((event) => (
              <EventItem key={event.id} event={event} />
            ))}

            {events.length > 20 && (
              <div className="text-center pt-4 text-gray-600 dark:text-gray-400">
                <p className="text-sm">Showing 20 of {events.length} events</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EventsList;
