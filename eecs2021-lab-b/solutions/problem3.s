# EECS 2021 Lab B — Problem 3 (full solution for RVS)
#
# IMPORTANT: Do NOT use x0 as the memory base.
# Address 0 is where your CODE lives. sw to 0(x0) overwrites instructions
# and RVS reports: ERROR: memw: #code adr=0x0 ...
# Put data at a separate address (here 0x100) and use that register as base.

        addi    x14, x0, 0x100      # x14 = DATA base (not code!)

        # ---- store eight values ----
        addi    x5, x0, 40
        addi    x6, x0, 20
        addi    x7, x0, 8
        addi    x8, x0, 4
        addi    x9, x0, 16
        addi    x10, x0, 32
        addi    x11, x0, 12
        addi    x12, x0, -8

        sw      x5, 0(x14)          # use x14, NOT x0
        sw      x6, 4(x14)
        sw      x7, 8(x14)
        sw      x8, 12(x14)
        sw      x9, 16(x14)
        sw      x10, 20(x14)
        sw      x11, 24(x14)
        sw      x12, 28(x14)

        # ---- /4 each value in place ----
        lw      x5, 0(x14)
        srai    x5, x5, 2
        sw      x5, 0(x14)

        lw      x6, 4(x14)
        srai    x6, x6, 2
        sw      x6, 4(x14)

        lw      x7, 8(x14)
        srai    x7, x7, 2
        sw      x7, 8(x14)

        lw      x8, 12(x14)
        srai    x8, x8, 2
        sw      x8, 12(x14)

        lw      x9, 16(x14)
        srai    x9, x9, 2
        sw      x9, 16(x14)

        lw      x10, 20(x14)
        srai    x10, x10, 2
        sw      x10, 20(x14)

        lw      x11, 24(x14)
        srai    x11, x11, 2
        sw      x11, 24(x14)

        lw      x12, 28(x14)
        srai    x12, x12, 2
        sw      x12, 28(x14)

        # ---- sum modified values, store at offset 32 ----
        add     x13, x5, x6
        add     x13, x13, x7
        add     x13, x13, x8
        add     x13, x13, x9
        add     x13, x13, x10
        add     x13, x13, x11
        add     x13, x13, x12
        sw      x13, 32(x14)        # don't forget the closing )
