#!/bin/bash

# Create a temporary directory for the operation
TEMP_DIR=$(mktemp -d)

# Find all jpg/jpeg files and copy them to temp directory
# This handles filenames with spaces and special characters
find . -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -exec cp {} "$TEMP_DIR" \;

# Counter for sequential naming
counter=0

# Process each file in the temp directory
for file in "$TEMP_DIR"/*; do
	if [ -f "$file" ]; then
		# Create the new filename with .jpeg extension
		new_name="${counter}.jpeg"

		# Copy back to current directory with new name
		cp "$file" "./$new_name"

		# Increment counter
		((counter++))
	fi
done

# Clean up the temporary directory
rm -rf "$TEMP_DIR"

echo "Renamed $counter files to sequential jpeg files (0.jpeg to $((counter - 1)).jpeg)"
