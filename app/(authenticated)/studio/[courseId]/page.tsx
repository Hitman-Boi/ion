export default function StudioPage({ params }: { params: { courseId: string } }) {
    return (
        <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
                <h3 className="text-lg font-medium">Select a block to edit</h3>
                <p>or create a new one from the sidebar.</p>
            </div>
        </div>
    );
}
