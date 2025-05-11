import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteLocalFile } from '../utils/DeleteUploadedFileFromLocal.js'; // Adjust path as necessary
import { unlink } from 'fs/promises';

vi.mock('fs/promises', () => ({
  unlink: vi.fn()
}));

describe('DeleteLocalFile', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
  });

  it("delete valid files and complete task", async () => {
    unlink.mockResolvedValue(); // Mock successfully Deleted
    await DeleteLocalFile("file1.txt", "file2.txt");

    expect(unlink).toHaveBeenCalledTimes(2);
    expect(unlink).toHaveBeenCalledWith("file1.txt");
    expect(unlink).toHaveBeenCalledWith("file2.txt");
  });

  it("skip non string inputs", async () => {
    unlink.mockResolvedValue();
    await DeleteLocalFile("file1.txt", 123, {}, "file2.txt");

    expect(unlink).toHaveBeenCalledTimes(2); // Only 2 strings should be deleted
  });

  it("handles deletion errors", async () => {
    unlink.mockRejectedValue(new Error("fail"));
    await DeleteLocalFile("file1.txt");

    expect(unlink).toHaveBeenCalledWith("file1.txt");
  });

  it("handles no input", async () => {
    await DeleteLocalFile();

    expect(unlink).not.toHaveBeenCalled(); // No files passed, so unlink shouldn't be called
  });
});
