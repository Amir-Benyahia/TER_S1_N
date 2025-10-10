class Maze:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.grid = [[Cell(x, y) for x in range(width)] for y in range(height)]

    def display(self):
        for row in self.grid:
            print(' '.join(str(cell) for cell in row))

    def set_cell(self, x, y, value):
        if 0 <= x < self.width and 0 <= y < self.height:
            self.grid[y][x] = value
        else:
            raise IndexError("Cell position out of bounds")

    def get_cell(self, x, y):
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.grid[y][x]
        else:
            raise IndexError("Cell position out of bounds")

class Cell:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.walls = {'N': True, 'S': True, 'E': True, 'W': True}

    def remove_wall(self, direction):
        if direction in self.walls:
            self.walls[direction] = False
        else:
            raise ValueError("Invalid wall direction")

    def has_wall(self, direction):
        if direction in self.walls:
            return self.walls[direction]
        else:
            raise ValueError("Invalid wall direction")