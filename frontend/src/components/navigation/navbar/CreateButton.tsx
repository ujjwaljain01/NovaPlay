import { useState } from 'react';
import { PlusIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { VideoUploadModal } from '@/features/videos/components/VideoUploadModal';

export function CreateButton() {
	const [uploadOpen, setUploadOpen] = useState(false);

	return (
		<>
			<Button
				type="button"
				variant="outline"
				className="gap-2 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
				onClick={() => setUploadOpen(true)}
				title="Create"
			>
				<PlusIcon size={16} />
				<span>Create</span>
			</Button>

			<VideoUploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
		</>
	);
}
