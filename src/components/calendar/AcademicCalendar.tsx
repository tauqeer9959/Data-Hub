import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  Filter
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useEducationLevel } from '../education/EducationLevelProvider';
import { toast } from 'sonner@2.0.3';

interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'assignment' | 'exam' | 'project' | 'certificate' | 'deadline' | 'reminder';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'overdue';
  relatedId?: string; // ID of related subject, project, etc.
  reminders: number[]; // Days before event to remind
}

interface CalendarView {
  month: Date;
  events: AcademicEvent[];
  selectedDate: Date | null;
}

export function AcademicCalendar() {
  const { user, session } = useAuth();
  const { currentLevel } = useEducationLevel();
  const [view, setView] = useState<CalendarView>({
    month: new Date(),
    events: [],
    selectedDate: null
  });
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AcademicEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [newEvent, setNewEvent] = useState<Partial<AcademicEvent>>({
    title: '',
    description: '',
    date: new Date(),
    type: 'assignment',
    priority: 'medium',
    reminders: [1, 7] // 1 day and 1 week before
  });

  // Mock data - replace with actual API calls
  const mockEvents: AcademicEvent[] = [
    {
      id: '1',
      title: 'Database Final Exam',
      description: 'Comprehensive exam covering all semester material',
      date: new Date('2024-02-15'),
      type: 'exam',
      priority: 'high',
      status: 'pending',
      reminders: [1, 3, 7]
    },
    {
      id: '2',
      title: 'Web Development Project Due',
      description: 'Final project submission for COMP-3001',
      date: new Date('2024-02-10'),
      type: 'project',
      priority: 'high',
      status: 'pending',
      reminders: [1, 7]
    },
    {
      id: '3',
      title: 'AWS Certification Exam',
      description: 'AWS Developer Associate certification',
      date: new Date('2024-02-20'),
      type: 'certificate',
      priority: 'medium',
      status: 'pending',
      reminders: [1, 7, 14]
    },
    {
      id: '4',
      title: 'Assignment 3 Due',
      description: 'Data Structures assignment',
      date: new Date('2024-02-05'),
      type: 'assignment',
      priority: 'medium',
      status: 'completed',
      reminders: [1, 3]
    }
  ];

  useEffect(() => {
    loadEvents();
  }, [currentLevel, view.month]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setView(prev => ({ ...prev, events: mockEvents }));
    } catch (error) {
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const event: AcademicEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        description: newEvent.description || '',
        date: newEvent.date,
        type: newEvent.type || 'assignment',
        priority: newEvent.priority || 'medium',
        status: 'pending',
        reminders: newEvent.reminders || [1, 7]
      };

      setView(prev => ({
        ...prev,
        events: [...prev.events, event]
      }));

      setNewEvent({
        title: '',
        description: '',
        date: new Date(),
        type: 'assignment',
        priority: 'medium',
        reminders: [1, 7]
      });
      setShowAddEvent(false);
      toast.success('Event added successfully');
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const handleEditEvent = async (event: AcademicEvent) => {
    try {
      setView(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === event.id ? event : e)
      }));
      setEditingEvent(null);
      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setView(prev => ({
        ...prev,
        events: prev.events.filter(e => e.id !== eventId)
      }));
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleToggleStatus = async (eventId: string) => {
    try {
      setView(prev => ({
        ...prev,
        events: prev.events.map(e => 
          e.id === eventId 
            ? { ...e, status: e.status === 'completed' ? 'pending' : 'completed' }
            : e
        )
      }));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getEventsForDate = (date: Date) => {
    return view.events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getFilteredEvents = () => {
    if (filterType === 'all') return view.events;
    return view.events.filter(event => event.type === filterType);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-red-500';
      case 'project': return 'bg-blue-500';
      case 'assignment': return 'bg-green-500';
      case 'certificate': return 'bg-purple-500';
      case 'deadline': return 'bg-orange-500';
      case 'reminder': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const upcomingEvents = view.events
    .filter(event => event.date >= new Date() && event.status !== 'completed')
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Academic Calendar</h1>
          <p className="text-muted-foreground">
            Manage your deadlines, exams, and important dates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="exam">Exams</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="certificate">Certificates</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new academic event, deadline, or reminder
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newEvent.priority} onValueChange={(value) => setNewEvent({ ...newEvent, priority: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="datetime-local"
                    value={newEvent.date?.toISOString().slice(0, 16)}
                    onChange={(e) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddEvent}>
                    Add Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={view.selectedDate}
              onSelect={(date) => setView(prev => ({ ...prev, selectedDate: date }))}
              modifiers={{
                hasEvents: (date) => getEventsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasEvents: { backgroundColor: '#3b82f6', color: 'white' }
              }}
              className="w-full"
            />
            
            {/* Events for selected date */}
            {view.selectedDate && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">
                  Events for {view.selectedDate.toLocaleDateString()}
                </h4>
                {getEventsForDate(view.selectedDate).map(event => (
                  <div key={event.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                      <span className="text-sm">{event.title}</span>
                      {getPriorityIcon(event.priority)}
                    </div>
                    <Badge variant={event.status === 'completed' ? 'secondary' : 'default'}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.map(event => (
              <div key={event.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getEventTypeColor(event.type)}`} />
                      <span className="font-medium text-sm">{event.title}</span>
                      {getPriorityIcon(event.priority)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
                    </p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.description.slice(0, 50)}...
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(event.id)}
                    >
                      {event.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingEvent(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="h-px bg-border" />
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming events
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event List */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFilteredEvents().map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{event.title}</span>
                      {getPriorityIcon(event.priority)}
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={event.status === 'completed' ? 'secondary' : 'default'}>
                    {event.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(event.id)}
                  >
                    {event.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingEvent(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Event Dialog */}
      {editingEvent && (
        <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Modify the details of your academic event
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={editingEvent.type} 
                    onValueChange={(value) => setEditingEvent({ ...editingEvent, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select 
                    value={editingEvent.priority} 
                    onValueChange={(value) => setEditingEvent({ ...editingEvent, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="datetime-local"
                  value={editingEvent.date.toISOString().slice(0, 16)}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: new Date(e.target.value) })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingEvent(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleEditEvent(editingEvent)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}