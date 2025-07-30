#!/bin/bash

# Git Worktree Manager Script
# Manages git worktrees in a .worktrees folder within the current repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
REPO_ROOT=""
WORKTREES_DIR=""

# Initialize and validate environment
init_environment() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Error: Not in a git repository${NC}"
        exit 1
    fi
    
    # Get repository root
    REPO_ROOT=$(git rev-parse --show-toplevel)
    WORKTREES_DIR="$REPO_ROOT/.worktrees"
    
    # Create .worktrees directory if it doesn't exist
    if [ ! -d "$WORKTREES_DIR" ]; then
        mkdir -p "$WORKTREES_DIR"
        echo -e "${GREEN}Created .worktrees directory${NC}"
    fi
}

# Display header information
show_header() {
    local repo_name=$(basename "$REPO_ROOT")
    local current_branch=$(git branch --show-current)
    
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Git Worktree Manager${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "Repository: ${GREEN}$repo_name${NC}"
    echo -e "Current Branch: ${GREEN}$current_branch${NC}"
    echo -e "Worktrees Directory: ${GREEN}$WORKTREES_DIR${NC}"
    echo ""
}

# List existing worktrees
list_worktrees() {
    local worktrees=()
    
    if [ -d "$WORKTREES_DIR" ]; then
        for dir in "$WORKTREES_DIR"/*; do
            if [ -d "$dir" ]; then
                worktrees+=($(basename "$dir"))
            fi
        done
    fi
    
    if [ ${#worktrees[@]} -eq 0 ]; then
        echo -e "${YELLOW}No worktrees found in .worktrees directory${NC}"
        echo ""
        return 1
    else
        echo -e "${GREEN}Existing Worktrees:${NC}"
        for i in "${!worktrees[@]}"; do
            echo -e "  $((i+1)). ${worktrees[i]}"
        done
        echo ""
        return 0
    fi
}

# Validate worktree name
validate_worktree_name() {
    local name="$1"
    
    # Check if empty
    if [ -z "$name" ]; then
        echo -e "${RED}Error: Name cannot be empty${NC}"
        return 1
    fi
    
    # Check length (1-50 characters)
    if [ ${#name} -gt 50 ]; then
        echo -e "${RED}Error: Name too long (max 50 characters)${NC}"
        return 1
    fi
    
    # Check for valid characters (alphanumeric, hyphens, underscores only)
    if [[ ! "$name" =~ ^[a-zA-Z0-9_-]+$ ]]; then
        echo -e "${RED}Error: Name can only contain letters, numbers, hyphens, and underscores${NC}"
        return 1
    fi
    
    # Check if worktree already exists
    if [ -d "$WORKTREES_DIR/$name" ]; then
        echo -e "${RED}Error: Worktree '$name' already exists${NC}"
        return 1
    fi
    
    # Check if branch already exists
    if git show-ref --verify --quiet "refs/heads/$name"; then
        echo -e "${RED}Error: Branch '$name' already exists${NC}"
        return 1
    fi
    
    return 0
}

# Create new worktree
create_worktree() {
    local name=""
    
    while true; do
        echo -e "${BLUE}Create New Worktree${NC}"
        echo -e "Enter worktree name (letters, numbers, hyphens, underscores only):"
        read -p "> " name
        
        if validate_worktree_name "$name"; then
            break
        fi
        echo ""
    done
    
    echo -e "${YELLOW}Creating worktree '$name'...${NC}"
    
    # Create the worktree
    if git worktree add "$WORKTREES_DIR/$name" -b "$name"; then
        echo -e "${GREEN}Successfully created worktree '$name'${NC}"
        echo -e "${YELLOW}Changing to worktree directory...${NC}"
        cd "$WORKTREES_DIR/$name"
        echo -e "${GREEN}Now in: $(pwd)${NC}"
        echo ""
        echo -e "${BLUE}Launching Claude Code...${NC}"
        exec claude
    else
        echo -e "${RED}Failed to create worktree '$name'${NC}"
        read -p "Press Enter to continue..."
    fi
}

# Open existing worktree
open_worktree() {
    local name="$1"
    local worktree_path="$WORKTREES_DIR/$name"
    
    if [ ! -d "$worktree_path" ]; then
        echo -e "${RED}Error: Worktree '$name' not found${NC}"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    echo -e "${YELLOW}Opening worktree '$name'...${NC}"
    echo -e "${YELLOW}Changing to worktree directory...${NC}"
    cd "$worktree_path"
    echo -e "${GREEN}Now in: $(pwd)${NC}"
    echo ""
    echo -e "${BLUE}Launching Claude Code...${NC}"
    exec claude
}

# Finish (remove) worktree
finish_worktree() {
    local name="$1"
    local worktree_path="$WORKTREES_DIR/$name"
    
    if [ ! -d "$worktree_path" ]; then
        echo -e "${RED}Error: Worktree '$name' not found${NC}"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    echo -e "${YELLOW}Are you sure you want to remove worktree '$name'? (y/N)${NC}"
    read -p "> " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing worktree '$name'...${NC}"
        
        if git worktree remove "$worktree_path"; then
            echo -e "${GREEN}Successfully removed worktree '$name'${NC}"
        else
            echo -e "${RED}Failed to remove worktree '$name'${NC}"
        fi
    else
        echo -e "${YELLOW}Cancelled${NC}"
    fi
    
    read -p "Press Enter to continue..."
}

# Handle worktree selection
select_worktree() {
    local worktrees=()
    
    # Get list of worktrees
    for dir in "$WORKTREES_DIR"/*; do
        if [ -d "$dir" ]; then
            worktrees+=($(basename "$dir"))
        fi
    done
    
    if [ ${#worktrees[@]} -eq 0 ]; then
        echo -e "${YELLOW}No worktrees available${NC}"
        read -p "Press Enter to continue..."
        return
    fi
    
    echo -e "${BLUE}Select a worktree:${NC}"
    for i in "${!worktrees[@]}"; do
        echo -e "  $((i+1)). ${worktrees[i]}"
    done
    echo ""
    
    while true; do
        read -p "Enter worktree number (1-${#worktrees[@]}): " selection
        
        if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#worktrees[@]} ]; then
            local selected_worktree="${worktrees[$((selection-1))]}"
            break
        else
            echo -e "${RED}Invalid selection. Please enter a number between 1 and ${#worktrees[@]}${NC}"
        fi
    done
    
    # Ask what to do with selected worktree
    echo ""
    echo -e "${BLUE}What would you like to do with worktree '$selected_worktree'?${NC}"
    echo -e "  1. Open (cd + launch Claude Code)"
    echo -e "  2. Finish (remove worktree)"
    echo -e "  3. Back to main menu"
    echo ""
    
    while true; do
        read -p "Enter your choice (1-3): " action
        
        case $action in
            1)
                open_worktree "$selected_worktree"
                break
                ;;
            2)
                finish_worktree "$selected_worktree"
                break
                ;;
            3)
                break
                ;;
            *)
                echo -e "${RED}Invalid choice. Please enter 1, 2, or 3${NC}"
                ;;
        esac
    done
}

# Main menu
show_main_menu() {
    while true; do
        clear
        show_header
        
        local has_worktrees=false
        if list_worktrees; then
            has_worktrees=true
        fi
        
        echo -e "${BLUE}Options:${NC}"
        if [ "$has_worktrees" = true ]; then
            echo -e "  1. Select existing worktree"
            echo -e "  2. Create new worktree"
            echo -e "  3. Exit"
        else
            echo -e "  1. Create new worktree"
            echo -e "  2. Exit"
        fi
        echo ""
        
        if [ "$has_worktrees" = true ]; then
            read -p "Enter your choice (1-3): " choice
            case $choice in
                1)
                    select_worktree
                    ;;
                2)
                    create_worktree
                    ;;
                3)
                    echo -e "${GREEN}Goodbye!${NC}"
                    exit 0
                    ;;
                *)
                    echo -e "${RED}Invalid choice. Please enter 1, 2, or 3${NC}"
                    read -p "Press Enter to continue..."
                    ;;
            esac
        else
            read -p "Enter your choice (1-2): " choice
            case $choice in
                1)
                    create_worktree
                    ;;
                2)
                    echo -e "${GREEN}Goodbye!${NC}"
                    exit 0
                    ;;
                *)
                    echo -e "${RED}Invalid choice. Please enter 1 or 2${NC}"
                    read -p "Press Enter to continue..."
                    ;;
            esac
        fi
    done
}

# Main execution
main() {
    init_environment
    show_main_menu
}

# Run the script
main "$@"