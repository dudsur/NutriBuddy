# EECS 2021 Lab B — Problem 3
# Store eight signed ints, divide each by 4 in place (no div), sum them,
# store the sum. Use lw/sw, no branches, track intermediates in registers.
#
# Handout starter values: 40, 20, 8, 4
# Remaining four (handout asks for eight but only lists four): 16, -8, 12, -4
#
# After /4: 10, 5, 2, 1, 4, -2, 3, -1
# Sum = 22  → stored after the array

        .data
arr:    .word   40, 20, 8, 4, 16, -8, 12, -4
sum:    .word   0

        .text
        # x10 = base address of arr (simulator / assembler resolves label)
        la      x10, arr

        # --- element 0 ---
        lw      x11, 0(x10)         # load value0
        srai    x11, x11, 2         # /4 via arithmetic shift
        sw      x11, 0(x10)         # store back
        add     x5, x0, x11         # running sum = value0/4

        # --- element 1 ---
        lw      x12, 4(x10)
        srai    x12, x12, 2
        sw      x12, 4(x10)
        add     x5, x5, x12

        # --- element 2 ---
        lw      x13, 8(x10)
        srai    x13, x13, 2
        sw      x13, 8(x10)
        add     x5, x5, x13

        # --- element 3 ---
        lw      x14, 12(x10)
        srai    x14, x14, 2
        sw      x14, 12(x10)
        add     x5, x5, x14

        # --- element 4 ---
        lw      x15, 16(x10)
        srai    x15, x15, 2
        sw      x15, 16(x10)
        add     x5, x5, x15

        # --- element 5 ---
        lw      x16, 20(x10)
        srai    x16, x16, 2
        sw      x16, 20(x10)
        add     x5, x5, x16

        # --- element 6 ---
        lw      x17, 24(x10)
        srai    x17, x17, 2
        sw      x17, 24(x10)
        add     x5, x5, x17

        # --- element 7 ---
        lw      x18, 28(x10)
        srai    x18, x18, 2
        sw      x18, 28(x10)
        add     x5, x5, x18

        # Store final sum at label `sum` (immediately after the array)
        sw      x5, 32(x10)         # sum = 22
