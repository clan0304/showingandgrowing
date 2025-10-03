'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import CountrySearch from '@/components/country-search';

type Travel = {
  id: string;
  destination_city: string;
  destination_country: string;
  start_date: string;
  end_date: string;
};

type TravelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  travel?: Travel | null;
};

export default function TravelDialog({
  open,
  onOpenChange,
  travel = null,
}: TravelDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination_city: '',
    destination_country: '',
    start_date: '',
    end_date: '',
  });

  const isEditing = !!travel;

  useEffect(() => {
    if (travel) {
      setFormData({
        destination_city: travel.destination_city,
        destination_country: travel.destination_country,
        start_date: travel.start_date,
        end_date: travel.end_date,
      });
    } else {
      setFormData({
        destination_city: '',
        destination_country: '',
        start_date: '',
        end_date: '',
      });
    }
  }, [travel, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountrySelect = (country: string | null) => {
    setFormData((prev) => ({
      ...prev,
      destination_country: country || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.destination_city || !formData.destination_country) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const url = isEditing ? `/api/travels/${travel.id}` : '/api/travels';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Failed to ${isEditing ? 'update' : 'add'} travel`
        );
      }

      toast.success(`Travel ${isEditing ? 'updated' : 'added'} successfully!`);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? 'update' : 'add'} travel`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Travel Plans' : 'Add Travel Plans'}
          </DialogTitle>
          <DialogDescription>
            Let others know where you&apos;ll be traveling. Your profile will
            appear in search results for this location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Destination - City and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="destination_city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="destination_city"
                name="destination_city"
                placeholder="e.g., Seoul"
                value={formData.destination_city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Country <span className="text-red-500">*</span>
              </Label>
              <CountrySearch
                value={formData.destination_country}
                onSelect={handleCountrySelect}
                placeholder="Select country"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                min={
                  formData.start_date || new Date().toISOString().split('T')[0]
                }
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            💡 Your profile will be visible in this location from 1 month before
            your start date until your end date.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? isEditing
                  ? 'Updating...'
                  : 'Adding...'
                : isEditing
                ? 'Update Travel'
                : 'Add Travel'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
