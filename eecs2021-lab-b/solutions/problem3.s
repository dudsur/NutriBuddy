# EECS 2021 Lab B — Problem 3 (full solution)
# Store eight signed ints with sw, divide each by 4 in place (srai),
# sum them, store the sum. No div, no branches.
#
# Handout starters: 40, 20, 8, 4
# Extra four (handout asks for 8 but lists 4): 16, -8, 12, -4
#
# After /4: 10, 5, 2, 1, 4, -2, 3, -1
# Sum = 22 stored at 32(x10)

        # ---- base address for the array ----
        # Pick any writable region your simulator allows.
        # RVS: often fine to use a label, or set x10 to a known data address.
        # Venus/RARS: you can also use la x10, arr with a .data block instead.
        addi    x10, x0, 0x100      # x10 = base of array

        # ---- 1) store eight values into memory ----
        addi    x11, x0, 40
        sw      x11, 0(x10)         # value0 = 40

        addi    x11, x0, 20
        sw      x11, 4(x10)         # value1 = 20

        addi    x11, x0, 8
        sw      x11, 8(x10)         # value2 = 8

        addi    x11, x0, 4
        sw      x11, 12(x10)        # value3 = 4

        addi    x11, x0, 16
        sw      x11, 16(x10)        # value4 = 16

        addi    x11, x0, -8
        sw      x11, 20(x10)        # value5 = -8

        addi    x11, x0, 12
        sw      x11, 24(x10)        # value6 = 12

        addi    x11, x0, -4
        sw      x11, 28(x10)        # value7 = -4

        # ---- 2) for each: lw, /4 via srai, sw back; keep running sum in x5 ----
        lw      x11, 0(x10)
        srai    x11, x11, 2         # 40/4 = 10
        sw      x11, 0(x10)
        add     x5, x0, x11         # sum = 10

        lw      x12, 4(x10)
        srai    x12, x12, 2         # 20/4 = 5
        sw      x12, 4(x10)
        add     x5, x5, x12         # sum = 15

        lw      x13, 8(x10)
        srai    x13, x13, 2         # 8/4 = 2
        sw      x13, 8(x10)
        add     x5, x5, x13         # sum = 17

        lw      x14, 12(x10)
        srai    x14, x14, 2         # 4/4 = 1
        sw      x14, 12(x10)
        add     x5, x5, x14         # sum = 18

        lw      x15, 16(x10)
        srai    x15, x15, 2         # 16/4 = 4
        sw      x15, 16(x10)
        add     x5, x5, x15         # sum = 22

        lw      x16, 20(x10)
        srai    x16, x16, 2         # -8/4 = -2
        sw      x16, 20(x10)
        add     x5, x5, x16         # sum = 20

        lw      x17, 24(x10)
        srai    x17, x17, 2         # 12/4 = 3
        sw      x17, 24(x10)
        add     x5, x5, x17         # sum = 23

        lw      x18, 28(x10)
        srai    x18, x18, 2         # -4/4 = -1
        sw      x18, 28(x10)
        add     x5, x5, x18         # sum = 22

        # ---- 3) store final sum ----
        sw      x5, 32(x10)         # mem[base+32] = 22
