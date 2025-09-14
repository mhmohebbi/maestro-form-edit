import os
import json
from pathlib import Path
import random

def create_comparison_json(method_a, method_b, generation_test_dir="generation_test", output_dir="data"):
    """
    Create a comparison JSON file between two image generation methods.
    
    Args:
        method_a (str): Name of the first method (folder name under generation_test)
        method_b (str): Name of the second method (folder name under generation_test)
        generation_test_dir (str): Path to the generation_test directory
        output_dir (str): Directory to save the output JSON file
    
    Returns:
        str: Path to the created JSON file
    """
    
    # Get absolute paths
    base_dir = Path(__file__).parent.parent
    method_a_dir = base_dir / generation_test_dir / method_a
    method_b_dir = base_dir / generation_test_dir / method_b
    output_path = base_dir / output_dir / f"{method_a}-{method_b}.json"
    
    # Check if directories exist
    if not method_a_dir.exists():
        raise FileNotFoundError(f"Method A directory not found: {method_a_dir}")
    if not method_b_dir.exists():
        raise FileNotFoundError(f"Method B directory not found: {method_b_dir}")
    
    # Get all files from both directories
    method_a_files = {f.name: f for f in method_a_dir.iterdir() if f.is_file() and not f.name.startswith('.')}
    method_b_files = {f.name: f for f in method_b_dir.iterdir() if f.is_file() and not f.name.startswith('.')}
    
    # Find common files
    common_files = set(method_a_files.keys()) & set(method_b_files.keys())
    
    if not common_files:
        raise ValueError(f"No common files found between {method_a} and {method_b}")
    
    # Create the JSON structure
    comparison_data = {
        "title": "Image Preference Survey",
        "description": "Please select the image with the best preservation, aesthetic and alignment to the instruction",
        "pages": []
    }
    
    # Sort files for consistent ordering
    sorted_files = sorted(common_files)
    
    for i, filename in enumerate(sorted_files, 1):
        # load f"generation_test/index2prompt.json" and use it to get the prompt
        with open(f"generation_test/index2prompt.json", "r") as f:
            index2prompt = json.load(f)
        index = filename.rsplit('.', 1)[0]
        prompt = index2prompt[index]

        # get the reference image
        reference_image_path = f"generation_test/reference_editing_pics/{index}.png"
        
        # Create relative paths for the images with URL encoding
        image_a_path = f"generation_test/{method_a}/{filename}"
        image_b_path = f"generation_test/{method_b}/{filename}"
        
        random_bool = random.random() < 0.5
        page = {
            "id": i,
            "prompt": prompt,
            "referenceImage": {
                "url": reference_image_path,
                "alt": "Reference image"
            },
            "imageA": {
                "url": image_a_path if random_bool else image_b_path,
                "alt": f"{prompt}",
                "method": method_a if random_bool else method_b
            },
            "imageB": {
                "url": image_b_path if random_bool else image_a_path,
                "alt": f"{prompt}",
                "method": method_b if random_bool else method_a
            }
        }
        
        comparison_data["pages"].append(page)
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Write the JSON file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(comparison_data, f, indent=2, ensure_ascii=False)
    
    print(f"Created comparison file: {output_path}")
    print(f"Number of image pairs: {len(comparison_data['pages'])}")
    
    return str(output_path)

# Example usage
if __name__ == "__main__":
    # Example: Compare maestro vs dalle3T2I
    # get a list of the folders in the generation_test directory
    folders = os.listdir("generation_test")
    for folder in folders:
        if os.path.isdir(f"generation_test/{folder}") and folder != "maestro" and '_' not in folder:
            try:
                output_file = create_comparison_json(folder, "maestro")
                print(f"Successfully created: {output_file}")
            except Exception as e:
                print(f"Error: {e}")
